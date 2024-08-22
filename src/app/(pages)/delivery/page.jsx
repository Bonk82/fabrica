'use client'
import { useSupa } from '@/app/context/SupabaseContext';
import { Avatar, Box, Button, Center, Group, LoadingOverlay, Modal, NativeSelect, NumberInput, Text, Textarea, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form';
import { IconCar, IconCheck, IconDeviceFloppy,  IconFolder, IconMail, IconMessage, IconPhone, IconProgressCheck, IconReceipt2, IconRefresh, IconUser } from '@tabler/icons-react';
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
  const [detalles, setDetalles] = useState([])

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
    console.log('preconfirma',data);
    setDetalles(data.detalle)
    const preform = {
      monto_pago:data.monto_pago,
      metodo_pago: data.metodo_pago,
      observacion:data.observacion,
    }
    form.setValues(preform)
    setId(data.id_pedido)
  }

  const confirmarEntrega = async (data) => {
    // event.preventDefault();
    console.log('la data',data);
    let cantidades = document.querySelectorAll("input[id^='p-']");
    cantidades.forEach(e => {
      console.log(e.value,e.id); // Muestra el valor de cada input
    });
    // return false;
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
      observacion:data.observacion,
      id_pedido:id
    }
    // if(id) datosDelivery.id_funcionario = id;
    console.log('new pedido',datosDelivery,id);
    try {
      await updateReg('pedido',datosDelivery);
      cargarData();
      toast('Control Entrega',`Entrega registrada satisfactoriamente!`,'success')

      cantidades.forEach( async d => {
        await  updateReg('pedido_detalle',{cantidad_entregada:Number(d.value),id_pedido_detalle:Number(d.id.replace('p-',''))})
      });

    } catch (error) {
      toast('Control Entrega',error.message || error,'error')
      console.log(error);
    }finally{
      form.reset();
      close()
      setId(null)
    }
  }

  const handdleCantidad = (c,id) =>{let nuevo_monto =  0
    detalles.forEach(d => {
      if(d.id_pedido_detalle == id) d.cantidad_entregada = Number(c)
      nuevo_monto += d.precio_unidad * d.cantidad_entregada
    });
    form.setFieldValue('monto_pago', nuevo_monto)
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
        <form onSubmit={form.onSubmit((values) => confirmarEntrega(values))}>
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
            placeholder='La observación sobre la entrega'
            leftSection={<IconMessage size={16} />}
            rows={2}
            key={form.key('observacion')}
            {...form.getInputProps('observacion')}
          />
          {
            detalles.map(d=>(
              <div key={d.id_pedido_detalle}>
                <NumberInput
                  label={`${d.producto} - Bs.${d.precio_unidad}`}
                  allowDecimal={false}
                  maxLength={3}
                  max={1000}
                  min={0}
                  leftSection={<IconProgressCheck size={16} />}
                  value={d.cantidad_entregada}
                  id={'p-' + d.id_pedido_detalle}
                  onChange={e=>handdleCantidad(e,d.id_pedido_detalle)}
                />
              </div>
            ))
          }
          <Button fullWidth mt={16} leftSection={<IconCheck/>} type='submit'>Confirmar</Button>
        </form>
        </Modal>
        <Box component='div' className='grid-cards'>
          {entregas.map(p=>(
            <div key={p.id_pedido} className="card-order bg-order" onClick={()=>preConfirma(p)}>
              <h2>{p.id_pedido} : {p.nombre}</h2>
              {(p.detalle || []).map(d=>(
                <div key={d.id_pedido_detalle} className='grid-productos'>
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