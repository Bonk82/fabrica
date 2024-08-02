'use client'
import { useSupa } from '@/app/context/SupabaseContext';
import { Avatar, Box, Button, Center, Group, LoadingOverlay, Modal, NativeSelect, NumberInput, Text, Textarea, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form';
import { IconCar, IconCheck, IconDeviceFloppy,  IconFolder, IconMail, IconMessage, IconPhone, IconReceipt2, IconRefresh, IconUser } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import classes from '../../toast.module.css';
import { modals } from '@mantine/modals';
import { useDisclosure } from '@mantine/hooks';
import dayjs from 'dayjs';
import { es } from "dayjs/locale/es";
const Page = () => {
  const { loading,usuario,entregas,getReg,updateReg,parametricas } = useSupa();
  const [id, setId] = useState(null)
  const [opened, { open, close }] = useDisclosure(false);

  dayjs.locale("es");

  useEffect(() => {
    cargarData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const cargarData = async () =>{
    await getReg('vw_entregas','id_pedido',true);
  }

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      monto_pago:0,
      metodo_pago: '',
      observacion:'',
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

  const preConfirma = async (data)=>{
    open()
    const preform = {
      monto_pago:data.monto_pago,
      metodo_pago: data.metodo_pago,
      observacion:data.observacion,
    }
    form.setValues(preform)
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
        <Modal
          opened={opened}
          onClose={close}
          title="Confirmar Entrega"
          overlayProps={{
            backgroundOpacity: 0.55,
            blur: 3,
          }}
        >
          <NumberInput
            label="Monto Pago:"
            placeholder="Monto pago"
            prefix='Bs. '
            defaultValue={0.00}
            decimalScale={2}
            fixedDecimalScale
            thousandSeparator=','
            maxLength={15}
            leftSection={<IconReceipt2 size={16} />}
            key={form.key('monto_pago')}
            {...form.getInputProps('monto_pago')}
          />
          <NativeSelect
            label="Método Pago:"
            data={['SELECCIONE...',...parametricas.filter(f=>f.tipo === 'METODO_PAGO').map(e=>e.nombre)]}
            leftSection={<IconFolder size={16} />}
            key={form.key('metodo_pago')}
            {...form.getInputProps('metodo_pago')}
          />
          <Textarea
            label="Observación:"
            placeholder='La observacion sobre el pedido'
            leftSection={<IconMessage size={16} />}
            rows={2}
            key={form.key('observacion')}
            {...form.getInputProps('observacion')}
          />
          <Button fullWidth mt={16} leftSection={<IconCheck/>} type='submit'>Confirmar</Button>
        </Modal>
        <Box component='div' className='grid-cards'>
          {entregas.map(p=>(
            <div key={p.id_pedido} className="card-order bg-order" onClick={()=>preConfirma(p)}>
              <h2>{p.id_pedido} : {p.nombre}</h2>
              {(p.detalle || []).map(d=>(
                <div key={d.id_detalle_pedido} className='grid-productos'>
                  <strong>{d.cantidad_solicitada}</strong> <label>{d.producto}</label>
                </div>
              ))}
              <h5>{dayjs(p.fecha_registro).format('dddd, DD MMM YYYY')}</h5> 
              <h5>Bs. {p.monto_pago.toLocaleString('de-De', {maximumFractionDigits: 1 })} - {p.metodo_pago}</h5> 
              <h4>{p.direccion || p.referencia}</h4>
            </div>
          ))}
        </Box>
      </Box>
    </div>
  )
}

export default Page