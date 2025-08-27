import { createTheme } from '@mantine/core';

export const theme = createTheme({
  // --- GENERAL THEME SETTINGS ---
  primaryColor: 'qsimBrown',
  fontFamily: 'Roboto Mono, monospace', // Sets the default font for the whole app

  colors: {
    qsimBrown: [
      '#F8F1E9', '#EFE5D9', '#E6D9C9', '#DDCDB9', '#D4C1A9',
      '#CCAFA0', '#C39D96', '#B27C72', '#A15B4E', '#903A2A'
    ],
  },
  
  // --- COMPONENT-SPECIFIC STYLES ---
  components: {
    // Styles for all <Title> components
    Title: {
      defaultProps: {
        // You can set default props here
      },
      styles: (theme) => ({
        root: {
          // Set title color to be slightly different from body text
          color: theme.colorScheme === 'dark' ? theme.colors.gray[2] : theme.colors.dark[1],
        },
      }),
    },

    // Styles for all <Button> components
    Button: {
      defaultProps: {
        // Make all buttons have a medium radius and a filled appearance by default
        radius: 'md',
        variant: 'filled',
      },
      styles: {
        // Style the inner label of the button
        label: {
          fontWeight: 600,
        },
      },
    },
    
    // Styles for all <Text> components
    Text: {
      styles: (theme) => ({
        root: {
          // Set default text color based on the theme
          color: theme.colorScheme === 'dark' ? theme.colors.gray[4] : theme.colors.dark[5],
        },
      }),
    },
  },
});
