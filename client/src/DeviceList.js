import React, { useState, useEffect } from 'react';
import {
  TextField,
  Grid,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Stack,
  Pagination,
  TableFooter,
  Tooltip,
  ButtonGroup,
  Menu,
  MenuItem as MuiMenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import DeviceHistory from './components/DeviceHistory';

function DeviceList() {
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    status: '',
    condition: '',
    description: ''
  });

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchDevices = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (typeFilter) params.append('type', typeFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (conditionFilter) params.append('condition', conditionFilter);
      params.append('page', page);
      params.append('limit', limit);

      console.log('Fetching devices...');
      const response = await fetch(`http://localhost:5000/api/devices?${params}`, {
        headers: getAuthHeader()
      });

      if (response.status === 401) {
        // Token hết hạn hoặc không hợp lệ
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDevices(Array.isArray(data) ? data : (data.devices || []));
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching devices:', error);
      setDevices([]);
      setTotalPages(1);
    }
  };

  // Effect để fetch dữ liệu khi component mount và khi các filter thay đổi
  useEffect(() => {
    console.log('Effect triggered, fetching devices...');
    fetchDevices();
  }, [search, typeFilter, statusFilter, conditionFilter, page]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleOpenDialog = (mode, device = null) => {
    setDialogMode(mode);
    setSelectedDevice(device);
    if (device) {
      setFormData({
        name: device.name,
        type: device.type,
        status: device.status,
        condition: device.condition,
        description: device.description || ''
      });
    } else {
      setFormData({
        name: '',
        type: '',
        status: '',
        condition: '',
        description: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDevice(null);
    setFormData({
      name: '',
      type: '',
      status: '',
      condition: '',
      description: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const url = dialogMode === 'create' 
        ? 'http://localhost:5000/api/devices'
        : `http://localhost:5000/api/devices/${selectedDevice._id}`;
      
      const method = dialogMode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: getAuthHeader(),
        body: JSON.stringify(formData),
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
        return;
      }

      if (response.ok) {
        handleCloseDialog();
        fetchDevices();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error:', error);
      // Hiển thị thông báo lỗi cho người dùng
      alert(error.message || 'Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  const handleDelete = async (deviceId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/devices/${deviceId}`, {
          method: 'DELETE',
          headers: getAuthHeader()
        });

        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.reload();
          return;
        }

        if (response.ok) {
          fetchDevices();
        } else {
          const error = await response.json();
          throw new Error(error.message || 'Không thể xóa thiết bị');
        }
      } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Có lỗi xảy ra, vui lòng thử lại');
      }
    }
  };

  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedDeviceHistory, setSelectedDeviceHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchDeviceHistory = async (deviceId) => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`http://localhost:5000/api/devices/${deviceId}/history`, {
        headers: getAuthHeader()
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
        return;
      }

      const data = await response.json();
      setSelectedDeviceHistory(data);
      setHistoryOpen(true);
    } catch (error) {
      console.error('Error fetching device history:', error);
      alert('Không thể tải lịch sử thiết bị');
    } finally {
      setLoadingHistory(false);
    }
  };

  const [exportAnchorEl, setExportAnchorEl] = useState(null);

  const handleExportClick = (event) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const handleExport = async (format) => {
    try {
      const response = await fetch(`http://localhost:5000/api/devices/export/${format}`, {
        method: 'GET',
        headers: getAuthHeader()
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Tạo blob từ response
      const blob = await response.blob();
      
      // Tạo URL cho blob
      const url = window.URL.createObjectURL(blob);
      
      // Tạo link tạm thời và click để tải file
      const a = document.createElement('a');
      a.href = url;
      a.download = format === 'excel' ? 'devices.xlsx' : 'devices.pdf';
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting file:', error);
      alert('Có lỗi khi xuất báo cáo. Vui lòng thử lại sau.');
    } finally {
      handleExportClose();
    }
  };

  return (
    <>
      <Typography variant="h5" sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
        Danh sách thiết bị
      </Typography>

      <Paper 
        sx={{ 
          p: 2, 
          mb: 3,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: 6,
            transform: 'translateY(-2px)'
          }
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography 
              variant="h6" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                color: 'primary.main',
                '& .MuiSvgIcon-root': {
                  transition: 'transform 0.3s ease-in-out',
                },
                '&:hover .MuiSvgIcon-root': {
                  transform: 'rotate(180deg)'
                }
              }}
            >
              <FilterAltIcon sx={{ mr: 1 }} /> Bộ lọc tìm kiếm
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Tìm kiếm thiết bị"
              variant="outlined"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nhập tên hoặc mô tả..."
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    '& fieldset': {
                      borderColor: 'primary.main',
                      borderWidth: '2px'
                    },
                    transform: 'translateY(-2px)'
                  },
                  '&.Mui-focused': {
                    '& fieldset': {
                      borderColor: 'primary.main',
                      borderWidth: '2px'
                    }
                  }
                }
              }}
            />
          </Grid>

          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              {/* Select fields with enhanced styling */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Loại thiết bị</InputLabel>
                  <Select
                    value={typeFilter}
                    label="Loại thiết bị"
                    onChange={(e) => setTypeFilter(e.target.value)}
                    sx={{
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                          borderWidth: '2px'
                        }
                      }
                    }}
                  >
                    <MenuItem value="">Tất cả loại</MenuItem>
                    <MenuItem value="Máy tính">Máy tính</MenuItem>
                    <MenuItem value="Máy in">Máy in</MenuItem>
                    <MenuItem value="Máy scan">Máy scan</MenuItem>
                    <MenuItem value="Khác">Khác</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Trạng thái"
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <MenuItem value="">Tất cả trạng thái</MenuItem>
                    <MenuItem value="active">Đang hoạt động</MenuItem>
                    <MenuItem value="inactive">Không hoạt động</MenuItem>
                    <MenuItem value="maintenance">Đang bảo trì</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Tình trạng</InputLabel>
                  <Select
                    value={conditionFilter}
                    label="Tình trạng"
                    onChange={(e) => setConditionFilter(e.target.value)}
                    sx={{
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <MenuItem value="">Tất cả tình trạng</MenuItem>
                    <MenuItem value="tốt">Tốt</MenuItem>
                    <MenuItem value="trung bình">Trung bình</MenuItem>
                    <MenuItem value="kém">Kém</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <ButtonGroup 
          variant="contained"
          sx={{
            '& .MuiButton-root': {
              height: '45px',
              fontSize: '0.9rem',
              fontWeight: 500,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 6
              }
            }
          }}
        >
          <Button
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('create')}
            sx={{ 
              px: 3,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            }}
          >
            Thêm thiết bị
          </Button>
          <Button
            color="primary"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportClick}
            sx={{ 
              px: 2,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            }}
          >
            Xuất
          </Button>
        </ButtonGroup>
        <Menu
          anchorEl={exportAnchorEl}
          open={Boolean(exportAnchorEl)}
          onClose={handleExportClose}
          sx={{
            '& .MuiMenuItem-root': {
              fontSize: '0.9rem',
              py: 1.5,
              px: 2,
              minWidth: '160px',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'primary.contrastText',
                transform: 'translateX(5px)'
              }
            }
          }}
        >
          <MuiMenuItem onClick={() => handleExport('excel')}>
            Xuất Excel
          </MuiMenuItem>
          <MuiMenuItem onClick={() => handleExport('pdf')}>
            Xuất PDF
          </MuiMenuItem>
        </Menu>
      </Box>

      <TableContainer 
        component={Paper} 
        sx={{ 
          mb: 4,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: 6
          }
        }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="device table">
          <TableHead>
            <TableRow sx={{ 
              backgroundColor: 'primary.light',
              '& .MuiTableCell-head': {
                color: 'primary.contrastText',
                fontWeight: 600
              }
            }}>
              <TableCell>Tên thiết bị</TableCell>
              <TableCell>Loại</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Tình trạng</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devices.map((device) => (
              <TableRow 
                key={device._id}
                sx={{
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    transform: 'scale(1.01)'
                  }
                }}
              >
                <TableCell component="th" scope="row">
                  {device.name}
                </TableCell>
                <TableCell>{device.type}</TableCell>
                <TableCell>{device.status}</TableCell>
                <TableCell>{device.condition}</TableCell>
                <TableCell>{device.description || '-'}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title="Xem lịch sử">
                      <IconButton
                        color="info"
                        onClick={() => fetchDeviceHistory(device._id)}
                        disabled={loadingHistory}
                        sx={{
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'rotate(360deg)'
                          }
                        }}
                      >
                        <HistoryIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog('edit', device)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(device._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {devices.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Không có thiết bị nào được tìm thấy
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={6}>
                <Box sx={{ 
                  mt: 2, 
                  display: 'flex', 
                  justifyContent: 'center',
                  '& .MuiPaginationItem-root': {
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.2)'
                    }
                  }
                }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {dialogMode === 'create' ? 'Thêm thiết bị mới' : 'Sửa thiết bị'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Tên thiết bị"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
            <FormControl fullWidth>
              <InputLabel>Loại thiết bị</InputLabel>
              <Select
                name="type"
                value={formData.type}
                label="Loại thiết bị"
                onChange={handleInputChange}
              >
                <MenuItem value="Máy tính">Máy tính</MenuItem>
                <MenuItem value="Máy in">Máy in</MenuItem>
                <MenuItem value="Máy scan">Máy scan</MenuItem>
                <MenuItem value="Khác">Khác</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                name="status"
                value={formData.status}
                label="Trạng thái"
                onChange={handleInputChange}
              >
                <MenuItem value="active">Đang hoạt động</MenuItem>
                <MenuItem value="inactive">Không hoạt động</MenuItem>
                <MenuItem value="maintenance">Đang bảo trì</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Tình trạng</InputLabel>
              <Select
                name="condition"
                value={formData.condition}
                label="Tình trạng"
                onChange={handleInputChange}
              >
                <MenuItem value="tốt">Tốt</MenuItem>
                <MenuItem value="trung bình">Trung bình</MenuItem>
                <MenuItem value="kém">Kém</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Mô tả"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            {dialogMode === 'create' ? 'Thêm' : 'Cập nhật'}
          </Button>
        </DialogActions>
      </Dialog>

      <DeviceHistory 
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={selectedDeviceHistory}
      />
    </>
  );
}

export default DeviceList;
