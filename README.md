# Hawkeye Frontend - Notus Angular Theme Recreation

A modern Angular dashboard application built with Tailwind CSS v4, featuring a comprehensive UI component library inspired by the Notus Angular design system.

## 🚀 Features

- **Modern Angular 17** with standalone components
- **Tailwind CSS v4** for utility-first styling
- **Responsive Design** with mobile-first approach
- **Customizable Theme System** with CSS custom properties
- **Reusable Components** with multiple variants and states
- **Dark Mode Support** (ready for implementation)
- **Accessibility Features** with proper ARIA labels and focus management

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#0ea5e9) - Main brand color
- **Secondary**: Gray (#64748b) - Supporting elements
- **Success**: Green (#22c55e) - Positive actions
- **Warning**: Yellow (#f59e0b) - Caution states
- **Danger**: Red (#ef4444) - Error states
- **Info**: Blue (#3b82f6) - Information states

### Typography
- **Font Family**: Inter (Google Fonts)
- **Font Weights**: 300, 400, 500, 600, 700, 800
- **Responsive**: Scales from 0.75rem to 3.75rem

### Components
- **Buttons**: 9 variants, 3 sizes, multiple states
- **Cards**: Flexible layout with headers, bodies, and footers
- **Inputs**: Form controls with validation states
- **Navbar**: Responsive navigation with mobile menu
- **Sidebar**: Collapsible navigation with nested items

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hawkeye-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200`

## 🛠️ Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run watch` - Build and watch for changes
- `npm test` - Run unit tests

### Project Structure

```
src/
├── app/
│   ├── shared/
│   │   └── components/
│   │       ├── button/
│   │       ├── card/
│   │       ├── input/
│   │       ├── navbar/
│   │       └── sidebar/
│   ├── pages/
│   │   └── dashboard/
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
├── styles/
│   ├── _theme.scss
│   └── styles.scss
├── index.html
└── main.ts
```

### Component Usage

#### Button Component
```typescript
<app-button 
  variant="primary" 
  size="md" 
  [disabled]="false"
  [fullWidth]="false"
  [rounded]="false"
  (onClick)="handleClick($event)"
>
  Click me
</app-button>
```

#### Card Component
```typescript
<app-card 
  header="Card Title" 
  subtitle="Card subtitle"
  [footer]="true"
  shadow="md"
>
  <p>Card content goes here</p>
  <div card-footer>
    <app-button variant="primary">Action</app-button>
  </div>
</app-card>
```

#### Input Component
```typescript
<app-input
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  [required]="true"
  icon="fas fa-envelope"
  [error]="emailError"
  hint="We'll never share your email"
></app-input>
```

#### Navbar Component
```typescript
<app-navbar
  [brandName]="'Hawkeye'"
  [navigationItems]="navItems"
  [user]="currentUser"
  [showNotifications]="true"
></app-navbar>
```

#### Sidebar Component
```typescript
<app-sidebar
  [brandName]="'Hawkeye'"
  [navigationItems]="sidebarItems"
  [user]="currentUser"
  [showToggle]="true"
  [isOpen]="true"
></app-sidebar>
```

## 🎨 Customization

### Theme Variables

All theme colors and properties are defined in `src/styles/_theme.scss` using CSS custom properties:

```scss
:root {
  --primary-500: #0ea5e9;
  --secondary-500: #64748b;
  --success-500: #22c55e;
  --warning-500: #f59e0b;
  --danger-500: #ef4444;
  --info-500: #3b82f6;
}
```

### Brand Color Customization

To customize the brand colors, simply update the CSS custom properties in the `:root` selector:

```scss
:root {
  // Your custom brand colors
  --primary-50: #fef7ff;
  --primary-100: #fdeeff;
  --primary-200: #fbdfff;
  --primary-300: #f8bfff;
  --primary-400: #f18fff;
  --primary-500: #e85dff;
  --primary-600: #d633ff;
  --primary-700: #b800e6;
  --primary-800: #9a00c4;
  --primary-900: #7c00a3;
}
```

### Tailwind Configuration

The Tailwind configuration is in `tailwind.config.js` and includes:

- Custom color palette
- Custom font families
- Custom spacing and shadows
- Custom animations and keyframes
- Responsive breakpoints

## 📱 Responsive Design

The application is built with a mobile-first approach:

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

All components are responsive and adapt to different screen sizes.

## ♿ Accessibility

The components include:

- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- High contrast support
- Semantic HTML structure

## 🧪 Testing

Run the test suite:

```bash
npm test
```

## 📦 Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by [Notus Angular](https://github.com/creativetimofficial/notus-angular)
- Built with [Angular](https://angular.io/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Font Awesome](https://fontawesome.com/)
- Fonts from [Google Fonts](https://fonts.google.com/)

## 📞 Support

For support and questions, please open an issue in the repository.
