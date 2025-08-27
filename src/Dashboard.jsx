import { useState, useEffect } from 'react';
import { useDisclosure } from '@mantine/hooks';
import {
  Button, Group, Title, Card, Text, Loader, Alert, Stack, Modal, TextInput, NumberInput
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

function Dashboard({ token, onLogout }) {
  const [circuits, setCircuits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [opened, { open, close }] = useDisclosure(false);
  const [newName, setNewName] = useState('');
  const [newQubits, setNewQubits] = useState(2);

  const fetchCircuits = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8000/api/v1/circuits', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch circuits.');
      const data = await response.json();
      setCircuits(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCircuits();
    }
  }, [token]);

  const handleCreateCircuit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/v1/circuits/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newName,
          qubits: newQubits,
          gates: [],
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to create circuit.');
      }
      close();
      setNewName('');
      setNewQubits(2);
      fetchCircuits();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Modal opened={opened} onClose={close} title="Create New Circuit">
        <form onSubmit={handleCreateCircuit}>
          <Stack>
            <TextInput
              label="Circuit Name"
              placeholder="My Bell State"
              value={newName}
              onChange={(e) => setNewName(e.currentTarget.value)}
              required
            />
            <NumberInput
              label="Number of Qubits"
              value={newQubits}
              onChange={setNewQubits}
              min={1}
              max={18}
              required
            />
            <Button type="submit" mt="md">Create Circuit</Button>
          </Stack>
        </form>
      </Modal>

      <Group justify="space-between" mb="md">
        <Title order={2}>Dashboard</Title>
        <Button onClick={onLogout} variant="default">Logout</Button>
      </Group>

      <Group justify="space-between" align="center" mt="xl" mb="md">
        <Title order={3}>My Circuits</Title>
        <Button onClick={open}>Create New Circuit</Button>
      </Group>

      {isLoading && <Loader />}
      {error && <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red">{error}</Alert>}
      
      {!isLoading && !error && (
        <Stack>
          {circuits.length > 0 ? (
            circuits.map((circuit) => (
              <Card shadow="sm" padding="lg" radius="md" withBorder key={circuit.id}>
                <Group justify="space-between">
                  <Text fw={500}>{circuit.name}</Text>
                  <Text size="sm" c="dimmed">{circuit.qubits} qubits</Text>
                </Group>
                <Button variant="light" color="blue" mt="md" radius="md">
                  Simulate
                </Button>
              </Card>
            ))
          ) : (
            <Text>You haven't created any circuits yet.</Text>
          )}
        </Stack>
      )}
    </>
  );
}

export default Dashboard;
