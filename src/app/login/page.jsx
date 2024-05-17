'use client'
import { TextInput, Checkbox, Button, Group, Box, Text, Flex, Center } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useSupa } from '../context/SupabaseContext';
import { useEffect } from 'react';
import { useRouter } from "next/navigation"

const Login = () => {
  const { loading, signInWithGoogle,singUpWithPassword, signInWithEmail,usuario } = useSupa();
  const router = useRouter()

  useEffect(() => {
    console.log('en login',usuario);
    if (usuario) router.push('/dashboard')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
      password:'',
      // termsOfService: false,
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Correo Inválido'),
    },
  });

  const login = async(valores)=>{
    console.log('login',valores);
    try {
      const r = await singUpWithPassword(valores.email,valores.password)
      console.log('respuesta',r);
    } catch (error) {
      console.log(erro);
    }
  }

  return (
    <Box maw={540} mx="auto" style={{marginTop:'12vh'}}>
      <Center>
        <Text c="cyan.4" size='50px' fw={900}
          variant="gradient"
          gradient={{ from: 'lightblue', to: 'cyan', deg: 90 }}>
          Fábrica de Hielos
        </Text>
      </Center>
      <form onSubmit={form.onSubmit((values) => login(values))}>
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
          key={form.key('password')}
          type='password'
          {...form.getInputProps('password')}
        />
        <Group justify="flex-end" mt="md">
          <Button onClick={login}>password</Button>
          <Button onClick={signInWithGoogle}>GOOGLE</Button>
          <Button type="submit">Ingresar</Button>
        </Group>
      </form>
    </Box>
  )
}

export default Login