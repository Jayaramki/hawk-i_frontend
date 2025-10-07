// Export client-grid interfaces with specific names to avoid conflicts
export { 
  ClientGridComponent,
  GridColumn as ClientGridColumn,
  GridAction as ClientGridAction
} from '../client-grid/client-grid.component';

// Export server-grid interfaces with specific names to avoid conflicts  
export {
  ServerGridComponent,
  GridColumn as ServerGridColumn,
  GridAction as ServerGridAction,
  PaginationInfo
} from '../server-grid/server-grid.component';

