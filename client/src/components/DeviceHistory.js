import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Chip
} from '@mui/material';
import { format } from 'date-fns';
import vi from 'date-fns/locale/vi';

const DeviceHistory = ({ open, onClose, history }) => {
  const getActionText = (action) => {
    switch (action) {
      case 'create':
        return 'Tạo mới';
      case 'update':
        return 'Cập nhật';
      case 'delete':
        return 'Xóa';
      default:
        return action;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'create':
        return 'success';
      case 'update':
        return 'primary';
      case 'delete':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderChanges = (changes, action) => {
    if (action === 'update') {
      const { before, after } = changes;
      const changedFields = [];
      
      Object.keys(before).forEach(key => {
        if (before[key] !== after[key] && key !== '_id' && key !== '__v') {
          changedFields.push(
            <Box key={key} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {key}: {before[key]} → {after[key]}
              </Typography>
            </Box>
          );
        }
      });
      
      return changedFields;
    }
    
    return null;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Lịch sử thay đổi thiết bị</DialogTitle>
      <DialogContent>
        <List>
          {history.map((record) => (
            <ListItem key={record._id} divider>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={getActionText(record.action)}
                      color={getActionColor(record.action)}
                      size="small"
                    />
                    <Typography variant="body1">
                      {format(new Date(record.createdAt), 'HH:mm:ss dd/MM/yyyy', { locale: vi })}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 1 }}>
                    {renderChanges(record.changes, record.action)}
                  </Box>
                }
              />
            </ListItem>
          ))}
          {history.length === 0 && (
            <ListItem>
              <ListItemText primary="Không có lịch sử thay đổi" />
            </ListItem>
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default DeviceHistory;