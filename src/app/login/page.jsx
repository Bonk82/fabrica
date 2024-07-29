'use client'
import { TextInput, Checkbox, Button, Group, Box, Text, Flex, Center } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useSupa } from '../context/SupabaseContext';
import { useEffect } from 'react';
import { useRouter } from "next/navigation"
import { IconRegistered,IconBrandGoogle,IconLogin } from '@tabler/icons-react';

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

  const signUp = async(valores)=>{
    console.log('signUp',valores);
    try {
      await singUpWithPassword(valores.email,valores.password)
    } catch (error) {
      console.log(error);
    }
  }

  const login = async(valores)=>{
    console.log('login',valores);
    try {
      await signInWithEmail(valores.email,valores.password)
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Box maw={540} mx="auto" style={{marginTop:'12vh',padding: '0 1rem'}}>
      <Center>
        <Text c="cyan.4" size='50px' fw={900}
          variant="gradient"
          gradient={{ from: 'lightblue', to: 'cyan', deg: 90 }}>
          Cristales Ice®
        </Text>
      </Center>
      <form onSubmit={form.onSubmit((values) => login(values))}>
        <TextInput
          withAsterisk
          id='elogin'
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
        <Group style={{display:'flex',flexWrap:'wrap',gap:'1rem',marginTop:'2rem'}}>
          <Button style={{flexGrow:'1',flexBasis:'200'}} leftSection={<IconRegistered/>} onClick={()=>signUp(form.values) }>Registrar</Button>
          <Button style={{flexGrow:'1',flexBasis:'200'}} leftSection={<IconLogin/>} type="submit">Ingresar</Button>
          <Button style={{flexGrow:'1',flexBasis:'200'}} leftSection={<IconBrandGoogle/>} onClick={signInWithGoogle}>Google</Button>
        </Group>
      </form>
    </Box>
  )
}

export default Login