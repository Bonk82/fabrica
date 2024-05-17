'use client'
import { TextInput, Checkbox, Button, Group, Box, Text, Flex, Center } from '@mantine/core';
import { useForm } from '@mantine/form';

const Login = () => {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
      pasword:'',
      // termsOfService: false,
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Correo Inválido'),
    },
  });


  return (
    <Box maw={540} mx="auto" style={{marginTop:'12vh'}}>
      <Center>
        <Text c="cyan.4" size='50px' fw={900}
          variant="gradient"
          gradient={{ from: 'lightblue', to: 'cyan', deg: 90 }}>
          Fábrica de Hielos
        </Text>
      </Center>
      <form onSubmit={form.onSubmit((values) => console.log(values))}>
        <TextInput
          withAsterisk
          label="Email"
          placeholder="your@email.com"
          key={form.key('email')}
          {...form.getInputProps('email')}
        />
        <TextInput
          withAsterisk
          label="Contraseña"
          placeholder="*****"
          key={form.key('pasword')}
          type='password'
          {...form.getInputProps('pasword')}
        />
        <Group justify="flex-end" mt="md">
          <Button type="submit">Ingresar</Button>
        </Group>
      </form>
    </Box>
  )
}

export default Login