import { useState } from 'react';
import { TextInput, PasswordInput, Button, Stack, Alert, Title, Paper, Center } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }
      const data = await response.json();
      onLogin(data.access_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Center style={{ minHeight: '100vh' }}>
      <Paper
        p={30}
        radius="md"
        style={(theme) => ({
          maxWidth: 420,
          backgroundColor: "#1b1b1b",
        })}
      >
        <Title ta="center" order={2}>
          Quantum Terminal Access
        </Title>
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Username"
              placeholder="Your callsign"
              value={username}
              onChange={(event) => setUsername(event.currentTarget.value)}
              required
              variant="filled"
            />
            <PasswordInput
              label="Password"
              placeholder="Your access key"
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              required
              variant="filled"
            />
            {error && (
              <Alert icon={<IconAlertCircle size="1rem" />} title="Access Denied" color="red" variant="filled">
                {error}
              </Alert>
            )}
            <Button type="submit" loading={isLoading} fullWidth mt="xl">
              Authorize
            </Button>
          </Stack>
        </form>
      </Paper>
    </Center>
  );
}

export default LoginPage;
