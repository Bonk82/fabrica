import { Box, NativeSelect } from '@mantine/core'
import { IconCalendar, IconCashBanknote, IconDiabolo, IconGasStation, IconTir } from '@tabler/icons-react'
import '../cards.css'
import { useSupa } from '../context/SupabaseContext';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

const Aside = () => {
  const { loading,transacciones,productos,getReg,getRegFilter } = useSupa();
  const [periodo, setPeriodo] = useState('DÍA')

  useEffect(() => {
    cargarData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cargarData = async () =>{
    await getReg('producto','id_producto',true);
    await getRegFilter('vw_transaccion','fecha_entrega',dayjs(dayjs().startOf('month')).format('YYYY-MM-DD 04:00:00'),'between',dayjs(dayjs().endOf('month')).format('YYYY-MM-DD 23:59:59'))
  }

  const onChangePeriodo = (e)=>{
    setPeriodo(e)
    let f1,f2
    if(e == 'DÍA'){
      f1 = dayjs()
      f2 = dayjs()
    } 
    if(e == 'SEMANA'){
      f1 = dayjs().startOf('week');
      f2 = dayjs().endOf('week')
    } 
    if(e == 'MES'){
      f1 = dayjs().startOf('month');
      f2 = dayjs().endOf('month')
    } 
    if(e == 'AÑO'){
      f1 = dayjs().startOf('year');
      f2 = dayjs().endOf('year')
    } 
    getRegFilter('vw_transaccion','fecha_entrega',dayjs(f1).format('YYYY-MM-DD 04:00:00'),'between',dayjs(f2).format('YYYY-MM-DD 23:59:59'))
  }
  

  return (
    <Box style={{justifyContent:'space-between',gap:'1rem',display:'flex',flexDirection:'column'}} >
      <NativeSelect
        label="Periodo:"
        data={['DÍA', 'SEMANA','MES','AÑO']}
        value={periodo}
        leftSection={<IconCalendar size={16} />}
        onChange={(event) => onChangePeriodo(event.currentTarget.value)}
      />
      {productos.map(p=>(
        <div className="card-box bg-primary" key={p.id_producto}>
          <div className="content">
            <div className='title'>{p.descripcion || 'PRODUCTO'}</div>
            <h2>{(p.existencia) || 0}</h2>
          </div>
          <div className="icon">
            <IconDiabolo size={50}/>
          </div>
        </div>
      ))}
      <div className="card-box bg-success">
        <div className="content">
          <div className='title'>Monto Ventas</div>
          <h2>{(transacciones.filter(f=>f.fid_pedido).reduce((ac,el)=> ac + Number(el.monto),0))
              .toLocaleString('de-De', {maximumFractionDigits: 1 })}</h2>
        </div>
        <div className="icon">
          <IconCashBanknote size={50}/>
        </div>
      </div>
      <div className="card-box bg-info">
        <div className="content">
          <div className='title'>Total Pedidos</div>
          <h2>{(transacciones.filter(f=>f.fid_pedido).length)
              .toLocaleString('de-De')}</h2>
        </div>
        <div className="icon">
          <IconTir size={50}/>
        </div>
      </div>
      <div className="card-box bg-danger">
        <div className="content">
          <div className='title'>Gastos Adminis.</div>
          <h2>{(transacciones.filter(f=>f.tipo_cuenta?.toUpperCase() == 'EGRESO' ).reduce((ac,el)=>ac+Number(el.monto),0))
              .toLocaleString('de-De', {maximumFractionDigits: 1 })}</h2>
        </div>
        <div className="icon">
          <IconGasStation size={50}/>
        </div>
      </div>
    </Box>
  )
}

export default Aside