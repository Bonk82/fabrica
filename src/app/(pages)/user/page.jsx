'use client'
import { useSupa } from '@/app/context/SupabaseContext';
import { Avatar, Box, Button, Center, Group, LoadingOverlay, Modal, NativeSelect, NumberInput, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form';
import { IconCar, IconDeviceFloppy,  IconFolder, IconMail, IconPhone, IconRefresh, IconUser } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import classes from '../../toast.module.css';
import { modals } from '@mantine/modals';
import { useDisclosure } from '@mantine/hooks';
const Page = () => {
  const { loading,usuario,createReg,parametricas,funcionarios,roles,getReg,updateReg } = useSupa();
  const [opened, { open, close }] = useDisclosure(false);
  const [id, setId] = useState(null)

  useEffect(() => {
    cargarData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const cargarData = async () =>{
    await getReg('vw_funcionario','id_funcionario',false);
    await getReg('rol','id_rol',false);
  }

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email:'',
      nombre:'',
      telefono:'',
      rol:'USUARIO',
      estado:'PENDIENTE',
    }
  });

  const toast = (title,message,type) =>{
    // return <Toast title='el totulo' message='el mensaje' type='error'/>
    let color = type
    if(type == 'success') color = 'lime.8';
    if(type == 'info') color = 'cyan.8';
    if(type == 'warning') color = 'yellow.8';
    if(type == 'error') color = 'red.8';
    notifications.show({
      title,
      message,
      color,
      classNames: classes,
    })
  }

  const registrarFuncionario = async (data) => {
    // event.preventDefault();
    console.log('la data',data);
    const newFuncionario = {
      fid_user:data.id,
      nombre:data.nombre.toUpperCase(),
      telefono:data.telefono,
      fid_rol:roles.filter(f=>f.descripcion == data.rol)[0].id_rol ,
      estado:data.estado,
    }
    if(id) newFuncionario.id_funcionario = id;
    console.log('new funcionario',newFuncionario,id);
    try {
      id ? await updateReg('funcionario',newFuncionario) : await createReg(newFuncionario,'funcionario');
      cargarData();
      toast('Control Usuario',`Usuario ${id? 'actualziado': 'registrado'} satisfactoriamente!`,'success')
    } catch (error) {
      toast('Control Usuario',error.message || error,'error')
      console.log(error);
    }finally{
      form.reset();
      close()
      setId(null)
    }
  }

  const confirmar = (e)=>{
    modals.openConfirmModal({
      title: 'Confirmar Eliminación',
      centered: true,
      children: (
        <Text size="sm">
        Está seguro de ELIMINAR el usuario: <strong>{e.nombre.toUpperCase()}</strong>
        </Text>
      ),
      labels: { confirm: 'Eliminar Usuario', cancel: "Cancelar" },
      confirmProps: { color: 'red' },
      onCancel: () => console.log('Cancel'),
      onConfirm: () => onDeleteFuncionario(e),
    });
  }

  const onDeleteFuncionario = async(e) => {
    console.log('delete funcionario',e);
    try {
      await deleteReg('funcionario',e.id_funcionario);
      toast('Control Usuario',`Usuario eliminado satisfactoriamente!`,'success')
    } catch (error) {
      toast('Control Usuario',error.message || error,'error')
    } finally{
      cargarData()
    } 
  }

  const mostrarRegistro = (data) =>{
    console.log('cargando data',data);
    open()
    setId(data.id_funcionario);
    form.setValues(data)
  }

  return (
    <div>
      <Center>
        <Text c="cyan.4" size='30px' fw={900}
          variant="gradient"
          gradient={{ from: 'lightblue', to: 'cyan', deg: 90 }}>
          Usuarios
        </Text>
      </Center>
      <Box pos='relative'>
        <LoadingOverlay
          visible={loading}
          zIndex={39}
          overlayProps={{ radius: 'lg', blur: 4 }}
          loaderProps={{ color: 'cyan', type: 'dots',size:'xl' }}
        />
        <Modal opened={opened} onClose={close} title={id?'Actualizar Proveedor: '+ id:'Registrar Proveedor'}
          size='lg' zIndex={20} overlayProps={{
            backgroundOpacity: 0.55,
            blur: 3,
          }}>
          <form onSubmit={form.onSubmit((values) => registrarFuncionario(values))}>
            <TextInput
              label="E-mail:"
              type='text'
              readOnly
              leftSection={<IconMail size={16} />}
              key={form.key('email')}
              {...form.getInputProps('email')}
            />
            <TextInput
              label="Nombre:"
              placeholder="Nombre del Usuario"
              type='text'
              maxLength={100}
              leftSection={<IconUser size={16} />}
              key={form.key('nombre')}
              {...form.getInputProps('nombre')}
            />
            <NumberInput
              label="Teléfono:"
              placeholder="60512345"
              allowDecimal={false}
              maxLength={8}
              leftSection={<IconPhone size={16} />}
              key={form.key('telefono')}
              {...form.getInputProps('telefono')}
            />
            <NativeSelect
              label="Estado:"
              data={['SELECCIONE...',...parametricas.filter(f=>f.tipo === 'ESTADO_FUNCIONARIO').map(e=>e.nombre)]}
              leftSection={<IconFolder size={16} />}
              key={form.key('estado')}
              {...form.getInputProps('estado')}
            />
            <NativeSelect
              label="Rol:"
              data={['SELECCIONE...',...roles.map(r=>r.descripcion)]}
              leftSection={<IconCar size={16} />}
              key={form.key('rol')}
              {...form.getInputProps('rol')}
            />
            <Group justify="flex-end" mt="md">
              {!id && <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit'>Registrar Usuario</Button>}
              {id && <Button fullWidth leftSection={<IconRefresh/>} type='submit'>Actualizar Usuario</Button>}
            </Group>
          </form>
        </Modal>
        <Box component='div' className='grid-usuarios'>
          {funcionarios.map(f=>(
            <div className={'card-usuario '+ (f.rol == 'ADMIN' ? 'bg-admin':f.rol == 'USUARIO'? 'bg-user':'bg-new')} key={f.email} onClick={()=>mostrarRegistro(f)}>
              <div className='content'>
                <div style={{width:'100%', display:'flex',justifyContent:'center'}}>
                  <Avatar src={f.data.avatar_url} alt="no image here" color="dark.0" size={'xl'} radius={'md'} />
                </div>
                <strong className='nombre'>{f.nombre || 'SIN NOMBRE'}</strong>
                <h2>{f.rol || 'SIN ROL'}</h2>
                <h3>{f.estado || 'PENDIENTE'}</h3>
                <p>{f.email || 'SIN CORREO'}</p>
              </div>
            </div>
          ))}
        </Box>
      </Box>
    </div>
  )
}

export default Page