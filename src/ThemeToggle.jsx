import { ActionIcon, useMantineColorScheme } from '@mantine/core';
import { IconSun, IconMoonStars } from '@tabler/icons-react';

function ThemeToggle({ toggleColorScheme }) {
  const { colorScheme } = useMantineColorScheme();

  return (
    <ActionIcon
      onClick={toggleColorScheme}
      size="lg"
      variant="default"
      aria-label="Toggle color scheme"
      style={{
        position: 'absolute',
        top: 15,
        left: 15,
        zIndex: 1000,
      }}
    >
      {colorScheme === 'dark' ? <IconSun size="1.2rem" /> : <IconMoonStars size="1.2rem" />}
    </ActionIcon>
  );
}

export default ThemeToggle;
