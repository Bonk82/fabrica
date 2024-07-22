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
import dayjs from 'dayjs';
const Page = () => {
  const { loading,usuario,pedidos,getReg,updateReg } = useSupa();
  const [id, setId] = useState(null)

  useEffect(() => {
    cargarData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const cargarData = async () =>{
    await getReg('vw_pedido','id_pedido',true);
  }

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

  const confirmarEntrega = async (data) => {
    // event.preventDefault();
    console.log('la data',data);
    //estado_pedido,monto_pago,estado_pago,fecha_pago,metodo_pago,metodo_entrega,fecha_modifica,usuario_modifica,observaciones
    //cantidad_entregada
    const datosDelivery = {
      estado_pedido:'ENTREGADO',
      monto_pago:data.monto_pago,
      estado_pago:'PAGADO',
      fecha_pago:dayjs().add(-4,'hours'),
      metodo_pago:data.metodo_pago,
      metodo_entrega:'REPARTIDOR',//todo: OJO colocar este en el claisifcador
      fecha_modifica:dayjs().add(-4,'hours'),
      usuario_modifica:usuario.id,
      observaciones:data.observaciones
    }
    if(id) datosDelivery.id_funcionario = id;
    console.log('new funcionario',datosDelivery,id);
    try {
      id ? await updateReg('funcionario',datosDelivery) : await createReg(datosDelivery,'funcionario');
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

  return (
    <div>
      <Center>
        <Text c="cyan.4" size='30px' fw={900}
          variant="gradient"
          gradient={{ from: 'lightblue', to: 'cyan', deg: 90 }}>
          Pedidos Pendientes
        </Text>
      </Center>
      <Box pos='relative'>
        <LoadingOverlay
          visible={loading}
          zIndex={39}
          overlayProps={{ radius: 'lg', blur: 4 }}
          loaderProps={{ color: 'cyan', type: 'dots',size:'xl' }}
        />
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