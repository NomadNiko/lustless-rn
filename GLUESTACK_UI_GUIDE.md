# Gluestack UI v3 - Complete Implementation Guide

This comprehensive guide covers everything you need to know about using Gluestack UI v3 in your React Native/Expo application.

## Table of Contents
1. [Philosophy & Core Concepts](#philosophy--core-concepts)
2. [Installation & Setup](#installation--setup)
3. [Component Architecture](#component-architecture)
4. [Theming & Styling](#theming--styling)
5. [Component Reference](#component-reference)
6. [Best Practices](#best-practices)

---

## Philosophy & Core Concepts

### Copy-Paste, Not NPM Dependency

Gluestack UI v3 follows a **copy-paste architecture** similar to shadcn/ui. Instead of installing components from npm, you copy them directly into your project:

```bash
npx gluestack-ui add button
```

This approach gives you:
- **Full ownership** of component code
- **No vendor lock-in**
- **Easy customization** without fighting abstractions
- **Type safety** with full TypeScript support

### Universal Components (Web + Native)

All components work identically across:
- **Web** (React DOM)
- **iOS** (React Native)
- **Android** (React Native)

Platform-specific styling using modifiers:
```tsx
<Button className="web:bg-red-500 ios:bg-blue-500 android:bg-green-500">
  <ButtonText>Hello</ButtonText>
</Button>
```

### Compound Component Pattern

Components use a **compound component pattern** for flexibility:

```tsx
<Button>
  <ButtonIcon as={EditIcon} />
  <ButtonText>Edit</ButtonText>
  <ButtonSpinner />
</Button>
```

Instead of props like `leftIcon`, you compose sub-components in any order.

### Tailwind CSS + NativeWind

Styling uses **Tailwind CSS** via **NativeWind**:
- Tailwind classes work in React Native
- Full dark mode support
- Responsive breakpoints
- Custom theme tokens via CSS variables

---

## Installation & Setup

### Prerequisites

- **Node**: >16
- **React Native**: ≥72.5
- **Expo**: ≥50
- **Next.js**: 13-15 (for web)

### Initialize Gluestack UI

```bash
npx gluestack-ui init
```

This command:
1. Creates `gluestack-ui.config.json`
2. Adds `GluestackUIProvider` to your project
3. Installs core components (icon, overlay, toast)
4. Configures required files:
   - `metro.config.js`
   - `babel.config.js`
   - `tailwind.config.js`
   - `global.css`
   - Entry file

### Project Structure

After init, you'll have:

```
your-project/
├── components/
│   └── ui/
│       ├── gluestack-ui-provider/
│       │   ├── index.tsx
│       │   └── config.ts          # Theme tokens
│       ├── button/
│       │   ├── index.tsx
│       │   └── styles.tsx
│       └── ...
├── app/
│   └── _layout.tsx                # Wrap with Provider
├── tailwind.config.js
├── global.css
└── gluestack-ui.config.json
```

### Root Layout Setup

Wrap your app with `GluestackUIProvider`:

```tsx
// app/_layout.tsx
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';

export default function RootLayout() {
  return (
    <GluestackUIProvider mode="light">
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </GluestackUIProvider>
  );
}
```

### Adding Components

```bash
# Add single component
npx gluestack-ui add button

# Add multiple components
npx gluestack-ui add button input checkbox

# Add all components
npx gluestack-ui add --all
```

### Tooling Setup (Optional)

#### VS Code IntelliSense

Add to `.vscode/settings.json`:

```json
{
  "tailwindCSS.experimental.classRegex": [
    ["tva\\((([^()]*|\\([^()]*\\))*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

#### Prettier Plugin

Add to `.prettierrc`:

```js
module.exports = {
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindFunctions: ['tva'],
};
```

---

## Component Architecture

### Anatomy of a Gluestack Component

Every component has:
1. **Main component** - Container with logic
2. **Sub-components** - Composable parts
3. **Styles file** - Tailwind variant styles using `tva`

Example structure (`button/index.tsx`):

```tsx
import { buttonStyle } from './styles';

const Button = forwardRef<ButtonProps>(({ className, variant, size, action, ...props }, ref) => {
  return (
    <Pressable
      ref={ref}
      className={buttonStyle({ variant, size, action, class: className })}
      {...props}
    />
  );
});

const ButtonText = ({ className, ...props }) => (
  <Text className={cn("font-medium", className)} {...props} />
);

const ButtonIcon = ({ as: AsComponent, className, ...props }) => (
  <AsComponent className={cn("w-4 h-4", className)} {...props} />
);

export { Button, ButtonText, ButtonIcon };
```

### Import Pattern

Always import from component barrel:

```tsx
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
```

### Component Composition

```tsx
<VStack space="md">
  <Button variant="solid" size="md" action="primary">
    <ButtonIcon as={SaveIcon} />
    <ButtonText>Save</ButtonText>
  </Button>

  <Button variant="outline" action="secondary">
    <ButtonSpinner />
    <ButtonText>Loading...</ButtonText>
  </Button>
</VStack>
```

### Data Attributes for State Styling

Components use data attributes for states:

```tsx
<Button isDisabled={true} isFocused={false}>
  {/* Applies data-disabled="true" data-focus="false" */}
</Button>
```

These are used in Tailwind styles:

```tsx
const buttonStyle = tva({
  base: "...",
  variants: {
    // ...
  },
  compoundVariants: [
    {
      class: "opacity-40 cursor-not-allowed",
      // Applied when data-disabled="true"
    }
  ]
});
```

---

## Theming & Styling

### Theme Configuration

Theme tokens live in `components/ui/gluestack-ui-provider/config.ts`:

```tsx
import { vars } from 'nativewind';

export const config = {
  light: vars({
    '--color-primary-0': '#C0C0C0',
    '--color-primary-500': '#333333',
    '--color-background-0': '#FFFFFF',
    '--color-typography-900': '#171717',
  }),
  dark: vars({
    '--color-primary-0': '#A6A6A6',
    '--color-primary-500': '#E6E6E6',
    '--color-background-0': '#121212',
    '--color-typography-900': '#F5F5F5',
  }),
};
```

### Adding Custom Tokens

**Step 1**: Add to `config.ts`

```tsx
export const config = {
  light: vars({
    // ... existing tokens
    '--color-background-custom': '#BAE7FC',
    '--custom-font-size': '80',
  }),
  dark: vars({
    // ... existing tokens
    '--color-background-custom': '#89D6FA',
    '--custom-font-size': '80',
  }),
};
```

**Step 2**: Add to `tailwind.config.js`

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        background: {
          // ... existing
          custom: 'var(--color-background-custom)',
        },
      },
      fontSize: {
        'custom-xl': 'var(--custom-font-size)',
      },
    },
  },
};
```

**Step 3**: Use in components

```tsx
<Box className="bg-background-custom">
  <Text className="text-custom-xl">Custom styled!</Text>
</Box>
```

### Dark Mode

#### Using CSS Variables (Recommended)

Toggle via `GluestackUIProvider`:

```tsx
const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');

<GluestackUIProvider mode={colorMode}>
  <Button onPress={() => setColorMode(mode === 'light' ? 'dark' : 'light')}>
    <ButtonText>Toggle Theme</ButtonText>
  </Button>
</GluestackUIProvider>
```

Tokens automatically switch based on `mode` prop.

#### Using Tailwind Dark Classes

```tsx
<Box className="bg-white dark:bg-black">
  <Text className="text-gray-900 dark:text-gray-100">Hello</Text>
</Box>
```

Update `tailwind.config.js`:

```js
module.exports = {
  darkMode: process.env.DARK_MODE ? process.env.DARK_MODE : 'media',
};
```

Update `package.json`:

```json
{
  "scripts": {
    "android": "DARK_MODE=media expo start --android",
    "ios": "DARK_MODE=media expo start --ios",
    "web": "DARK_MODE=class expo start --web"
  }
}
```

### Persisting Dark Mode

Install storage:

```bash
npm i @react-native-async-storage/async-storage
```

Create `ThemeProvider`:

```tsx
// components/ui/ThemeProvider.tsx
import { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    (async () => {
      const savedTheme = (await AsyncStorage.getItem("theme")) as Theme | "light";
      if (savedTheme) {
        setTheme(savedTheme);
      }
    })();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    AsyncStorage.setItem("theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
```

---

## Component Reference

### Layout Components

#### Box

Basic container (renders `<div>` on web, `<View>` on native):

```tsx
import { Box } from '@/components/ui/box';

<Box className="bg-primary-500 p-5">
  <Text>Content</Text>
</Box>
```

#### VStack / HStack

Vertical/horizontal stacking with spacing:

```tsx
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';

<VStack space="md" reversed={false}>
  <Box className="h-16 w-16 bg-primary-300" />
  <Box className="h-16 w-16 bg-primary-500" />
</VStack>

<HStack space="lg">
  <Box />
  <Box />
</HStack>
```

**Props**:
- `space`: xs | sm | md | lg | xl | 2xl | 3xl | 4xl
- `reversed`: boolean

#### Center

Centers content:

```tsx
import { Center } from '@/components/ui/center';

<Center>
  <Text>Centered content</Text>
</Center>
```

### Typography

#### Text

```tsx
import { Text } from '@/components/ui/text';

<Text size="md" bold italic className="text-typography-900">
  Hello World
</Text>
```

**Props**:
- `size`: 2xs | xs | sm | md | lg | xl | 2xl | 3xl | 4xl | 5xl | 6xl
- `bold`, `italic`, `underline`, `strikeThrough`, `highlight`: boolean
- `isTruncated`: boolean

#### Heading

```tsx
import { Heading } from '@/components/ui/heading';

<Heading size="2xl">Page Title</Heading>
```

**Props**: Same as Text
**Renders**:
- `5xl`, `4xl`, `3xl` → `<h1>`
- `2xl` → `<h2>`
- `xl` → `<h3>`

### Form Components

#### Button

```tsx
import { Button, ButtonText, ButtonIcon, ButtonSpinner } from '@/components/ui/button';
import { SaveIcon } from '@/components/ui/icon';

<Button
  variant="solid"        // solid | outline | link
  size="md"              // xs | sm | md | lg | xl
  action="primary"       // primary | secondary | positive | negative
  isDisabled={false}
  onPress={() => {}}
>
  <ButtonIcon as={SaveIcon} />
  <ButtonText>Save</ButtonText>
  <ButtonSpinner />
</Button>
```

**Loading State**:
```tsx
<Button>
  <ButtonSpinner />
  <ButtonText>Loading...</ButtonText>
</Button>
```

#### Input

```tsx
import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input';
import { SearchIcon, EyeIcon } from '@/components/ui/icon';

<Input
  variant="outline"      // outline | rounded | underlined
  size="md"              // sm | md | lg | xl
  isDisabled={false}
  isInvalid={false}
  isReadOnly={false}
>
  <InputSlot className="pl-3">
    <InputIcon as={SearchIcon} />
  </InputSlot>
  <InputField
    type="text"
    placeholder="Enter email..."
  />
  <InputSlot className="pr-3">
    <InputIcon as={EyeIcon} />
  </InputSlot>
</Input>
```

**Platform Output**:
- Web: `<input />`
- Native: `<TextInput />`

#### Checkbox

```tsx
import { Checkbox, CheckboxIndicator, CheckboxIcon, CheckboxLabel, CheckboxGroup } from '@/components/ui/checkbox';
import { CheckIcon } from '@/components/ui/icon';

<CheckboxGroup value={values} onChange={setValues}>
  <VStack space="md">
    <Checkbox value="option1" size="md">
      <CheckboxIndicator>
        <CheckboxIcon as={CheckIcon} />
      </CheckboxIndicator>
      <CheckboxLabel>Option 1</CheckboxLabel>
    </Checkbox>

    <Checkbox value="option2">
      <CheckboxIndicator>
        <CheckboxIcon as={CheckIcon} />
      </CheckboxIndicator>
      <CheckboxLabel>Option 2</CheckboxLabel>
    </Checkbox>
  </VStack>
</CheckboxGroup>
```

#### Textarea

```tsx
import { Textarea, TextareaInput } from '@/components/ui/textarea';

<Textarea
  size="md"              // sm | md | lg | xl
  isDisabled={false}
  isInvalid={false}
  isReadOnly={false}
>
  <TextareaInput placeholder="Enter message..." />
</Textarea>
```

#### FormControl

Wrapper for form fields with labels, helpers, and errors:

```tsx
import { FormControl, FormControlLabel, FormControlLabelText, FormControlHelper, FormControlHelperText, FormControlError, FormControlErrorText } from '@/components/ui/form-control';

<FormControl isInvalid={hasError} isRequired>
  <FormControlLabel>
    <FormControlLabelText>Email</FormControlLabelText>
  </FormControlLabel>

  <Input>
    <InputField type="email" />
  </Input>

  <FormControlHelper>
    <FormControlHelperText>We'll never share your email</FormControlHelperText>
  </FormControlHelper>

  <FormControlError>
    <FormControlErrorText>Email is required</FormControlErrorText>
  </FormControlError>
</FormControl>
```

### Feedback Components

#### Alert

```tsx
import { Alert, AlertIcon, AlertText } from '@/components/ui/alert';
import { InfoIcon } from '@/components/ui/icon';

<Alert
  action="info"         // info | error | warning | success | muted
  variant="solid"       // solid | outline
>
  <AlertIcon as={InfoIcon} />
  <AlertText>Your changes have been saved</AlertText>
</Alert>
```

#### Toast

```tsx
import { useToast, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';

function MyComponent() {
  const toast = useToast();

  const showToast = () => {
    toast.show({
      placement: 'top',          // top | bottom | top-left | top-right | bottom-left | bottom-right
      duration: 3000,            // null = never dismiss
      render: ({ id }) => (
        <Toast nativeID={`toast-${id}`} action="success" variant="solid">
          <ToastTitle>Success!</ToastTitle>
          <ToastDescription>Your changes were saved</ToastDescription>
        </Toast>
      ),
    });
  };

  return <Button onPress={showToast}><ButtonText>Show Toast</ButtonText></Button>;
}
```

#### Spinner

```tsx
import { Spinner } from '@/components/ui/spinner';

<Spinner size="large" />  {/* small | large */}
```

#### Progress

```tsx
import { Progress, ProgressFilledTrack } from '@/components/ui/progress';

<Progress value={60} size="md">
  <ProgressFilledTrack />
</Progress>
```

### Overlay Components

#### Modal

```tsx
import { Modal, ModalBackdrop, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@/components/ui/modal';
import { Icon, CloseIcon } from '@/components/ui/icon';

const [showModal, setShowModal] = useState(false);

<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  size="md"             // xs | sm | md | lg | full
>
  <ModalBackdrop />
  <ModalContent>
    <ModalHeader>
      <Heading size="lg">Title</Heading>
      <ModalCloseButton>
        <Icon as={CloseIcon} />
      </ModalCloseButton>
    </ModalHeader>

    <ModalBody>
      <Text>Modal content goes here</Text>
    </ModalBody>

    <ModalFooter>
      <Button variant="outline" onPress={() => setShowModal(false)}>
        <ButtonText>Cancel</ButtonText>
      </Button>
      <Button onPress={() => setShowModal(false)}>
        <ButtonText>Save</ButtonText>
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>
```

### Data Display

#### Card

```tsx
import { Card } from '@/components/ui/card';

<Card
  variant="elevated"     // elevated | outline | ghost | filled
  size="md"              // sm | md | lg
  className="p-4"
>
  <Heading size="md">Card Title</Heading>
  <Text size="sm">Card content...</Text>
</Card>
```

#### Badge

```tsx
import { Badge, BadgeText, BadgeIcon } from '@/components/ui/badge';

<Badge
  action="success"       // success | error | warning | info | muted
  variant="solid"        // solid | outline
  size="md"
>
  <BadgeText>New</BadgeText>
  <BadgeIcon as={CheckIcon} />
</Badge>
```

#### Image

```tsx
import { Image } from '@/components/ui/image';

<Image
  source={{ uri: 'https://...' }}
  alt="Description"
  size="xl"              // 2xs | xs | sm | md | lg | xl | 2xl | full
  className="rounded-lg"
/>
```

**Platform Output**:
- Web: `<img />`
- Native: `<Image />`

#### Avatar

```tsx
import { Avatar, AvatarImage, AvatarFallbackText, AvatarBadge } from '@/components/ui/avatar';

<Avatar size="md">
  <AvatarFallbackText>JD</AvatarFallbackText>
  <AvatarImage source={{ uri: 'https://...' }} />
  <AvatarBadge />
</Avatar>
```

---

## Best Practices

### 1. Always Use Compound Components

**Good**:
```tsx
<Button>
  <ButtonIcon as={SaveIcon} />
  <ButtonText>Save</ButtonText>
</Button>
```

**Bad**:
```tsx
<Button leftIcon={SaveIcon}>Save</Button>  // This doesn't exist in Gluestack v3
```

### 2. Use VStack/HStack for Spacing

**Good**:
```tsx
<VStack space="md">
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</VStack>
```

**Bad**:
```tsx
<Box>
  <Text className="mb-4">Item 1</Text>
  <Text>Item 2</Text>
</Box>
```

### 3. Platform-Specific Styling

Use platform modifiers when needed:

```tsx
<Box className="p-4 web:p-6 ios:p-3 android:p-3">
  {/* Different padding per platform */}
</Box>
```

### 4. Responsive Design

Use Tailwind breakpoints:

```tsx
<Box className="w-full md:w-1/2 lg:w-1/3">
  {/* Responsive width */}
</Box>
```

### 5. Accessibility

Components have built-in accessibility:
- Proper ARIA attributes
- Keyboard navigation
- Screen reader support

Always provide:
```tsx
<Input>
  <InputField
    placeholder="Email"
    accessibilityLabel="Email address"
    accessibilityHint="Enter your email to sign in"
  />
</Input>
```

### 6. Form Validation

Use FormControl for consistent error handling:

```tsx
<FormControl isInvalid={!!errors.email}>
  <FormControlLabel>
    <FormControlLabelText>Email</FormControlLabelText>
  </FormControlLabel>
  <Input>
    <InputField {...register('email')} />
  </Input>
  {errors.email && (
    <FormControlError>
      <FormControlErrorText>{errors.email.message}</FormControlErrorText>
    </FormControlError>
  )}
</FormControl>
```

### 7. Loading States

Always provide feedback:

```tsx
<Button isDisabled={isLoading} onPress={handleSubmit}>
  {isLoading && <ButtonSpinner />}
  <ButtonText>{isLoading ? 'Saving...' : 'Save'}</ButtonText>
</Button>
```

### 8. Component Customization

You own the code—customize freely:

```tsx
// components/ui/button/index.tsx
// Add your own variants, modify styles, add props
const buttonStyle = tva({
  base: "...",
  variants: {
    variant: {
      custom: "bg-gradient-to-r from-purple-500 to-pink-500",
    },
  },
});
```

### 9. TypeScript

Components are fully typed:

```tsx
import type { ButtonProps } from '@/components/ui/button';

const CustomButton: React.FC<ButtonProps> = (props) => {
  return <Button {...props} />;
};
```

### 10. Testing

Components work with React Native Testing Library:

```tsx
import { render, fireEvent } from '@testing-library/react-native';
import { Button, ButtonText } from '@/components/ui/button';

test('button press works', () => {
  const onPress = jest.fn();
  const { getByText } = render(
    <Button onPress={onPress}>
      <ButtonText>Click me</ButtonText>
    </Button>
  );

  fireEvent.press(getByText('Click me'));
  expect(onPress).toHaveBeenCalled();
});
```

---

## Available Components List

Use `npx gluestack-ui add [component-name]`:

**Typography**: heading, text
**Layout**: box, center, divider, hstack, vstack, grid
**Forms**: button, checkbox, form-control, input, link, pressable, radio, select, slider, switch, textarea
**Feedback**: alert, progress, spinner, toast
**Overlay**: alert-dialog, drawer, menu, modal, popover, portal, tooltip
**Disclosure**: actionsheet, accordion
**Data Display**: badge, card, table
**Media**: avatar, image, icon
**Others**: fab, skeleton

---

## Common Patterns for Auth Screens

### Login Form

```tsx
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { FormControl, FormControlError, FormControlErrorText } from '@/components/ui/form-control';
import { EyeIcon, EyeOffIcon } from '@/components/ui/icon';

function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <VStack space="lg" className="p-6">
      <Heading size="2xl">Welcome Back</Heading>
      <Text size="sm" className="text-typography-500">
        Sign in to continue
      </Text>

      <VStack space="md">
        <FormControl>
          <Input>
            <InputField
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </Input>
        </FormControl>

        <FormControl>
          <Input>
            <InputField
              placeholder="Password"
              type={showPassword ? 'text' : 'password'}
            />
            <InputSlot onPress={() => setShowPassword(!showPassword)}>
              <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
            </InputSlot>
          </Input>
        </FormControl>

        <Button>
          <ButtonText>Sign In</ButtonText>
        </Button>
      </VStack>
    </VStack>
  );
}
```

### OTP Input (Custom Component)

```tsx
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';

function OTPInput({ length = 6, value, onChange }) {
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, index: number) => {
    const newValue = value.split('');
    newValue[index] = text;
    onChange(newValue.join(''));

    // Auto-focus next
    if (text && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  return (
    <HStack space="sm">
      {Array.from({ length }).map((_, i) => (
        <Input key={i} className="w-12">
          <InputField
            ref={ref => inputs.current[i] = ref}
            value={value[i] || ''}
            onChangeText={text => handleChange(text, i)}
            maxLength={1}
            keyboardType="number-pad"
            textAlign="center"
          />
        </Input>
      ))}
    </HStack>
  );
}
```

---

## Troubleshooting

### Components not styling correctly

1. Ensure `global.css` is imported in root layout
2. Check `tailwind.config.js` includes all paths
3. Verify `GluestackUIProvider` wraps app

### Dark mode not working

1. Check `mode` prop on `GluestackUIProvider`
2. Verify tokens defined in both `light` and `dark` in `config.ts`
3. For Tailwind dark: classes, check `darkMode` in tailwind.config

### TypeScript errors

Components are fully typed. If getting errors:
1. Ensure `@types/react` and `@types/react-native` are installed
2. Check you're importing from correct path
3. Verify component props match documentation

---

## Resources

- **Documentation**: https://gluestack.io/ui/docs
- **GitHub**: https://github.com/gluestack/gluestack-ui
- **Discord**: https://discord.gg/gluestack
- **Figma Kit**: Available in docs

---

This guide covers the essential knowledge for building production-ready apps with Gluestack UI v3. Remember: you own the component code, so customize freely to match your design system!
