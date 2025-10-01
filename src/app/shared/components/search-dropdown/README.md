# Search Dropdown Component

A reusable search dropdown component for the design system that provides searchable dropdown functionality with keyboard navigation.

## Features

- 🔍 **Searchable**: Type to search through options
- ⌨️ **Keyboard Navigation**: Arrow keys, Enter, Escape support
- 🎯 **Debounced Search**: Configurable debounce time for performance
- 🧹 **Clearable**: Optional clear button
- 🌙 **Dark Mode**: Full dark mode support
- ♿ **Accessible**: Proper ARIA attributes and keyboard support
- 📱 **Responsive**: Works on all screen sizes

## Usage

```typescript
import { SearchDropdownComponent, SearchDropdownOption } from './shared/components/search-dropdown/search-dropdown.component';

// In your component
export class MyComponent {
  employees: SearchDropdownOption[] = [
    { label: 'John Doe', value: 1 },
    { label: 'Jane Smith', value: 2 },
    { label: 'Bob Johnson', value: 3 }
  ];

  onEmployeeSelect(employee: SearchDropdownOption | null): void {
    console.log('Selected employee:', employee);
  }

  onSearchChange(searchTerm: string): void {
    console.log('Search term:', searchTerm);
  }
}
```

```html
<app-search-dropdown
  [options]="employees"
  placeholder="Search employees..."
  [clearable]="true"
  [debounceTime]="300"
  [minSearchLength]="1"
  (selectionChange)="onEmployeeSelect($event)"
  (searchChange)="onSearchChange($event)">
</app-search-dropdown>
```

## API

### Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `options` | `SearchDropdownOption[]` | `[]` | Array of options to display |
| `placeholder` | `string` | `'Search...'` | Placeholder text for input |
| `noResultsText` | `string` | `'No results found'` | Text shown when no results |
| `clearable` | `boolean` | `true` | Show clear button |
| `debounceTime` | `number` | `300` | Debounce time in milliseconds |
| `minSearchLength` | `number` | `0` | Minimum characters to start search |
| `disabled` | `boolean` | `false` | Disable the component |

### Outputs

| Event | Type | Description |
|-------|------|-------------|
| `selectionChange` | `SearchDropdownOption \| null` | Emitted when selection changes |
| `searchChange` | `string` | Emitted when search term changes (debounced) |

### Methods

| Method | Description |
|--------|-------------|
| `setSelectedOption(option)` | Programmatically set selected option |
| `clear()` | Clear the selection |

## SearchDropdownOption Interface

```typescript
interface SearchDropdownOption {
  label: string;        // Display text
  value: any;          // Value to emit
  searchText?: string;  // Optional custom search text
}
```

## Keyboard Navigation

- **Arrow Down/Up**: Navigate through options
- **Enter**: Select highlighted option
- **Escape**: Close dropdown
- **Type**: Search through options

## Examples

### Basic Usage
```html
<app-search-dropdown
  [options]="options"
  (selectionChange)="onSelect($event)">
</app-search-dropdown>
```

### With Custom Search
```html
<app-search-dropdown
  [options]="employees"
  placeholder="Search by name or email..."
  [minSearchLength]="2"
  [debounceTime]="500"
  (selectionChange)="onEmployeeSelect($event)"
  (searchChange)="onSearch($event)">
</app-search-dropdown>
```

### Disabled State
```html
<app-search-dropdown
  [options]="options"
  [disabled]="true">
</app-search-dropdown>
```
