import { Box } from '@mantine/core'
import { IconBadge4k } from '@tabler/icons-react'
import '../cards.css'

const Aside = () => {
  return (
    <Box style={{justifyContent:'space-between',gap:'1rem',display:'flex',flexDirection:'column'}} >
      <div className="card-box bg-blue">
        <div className="content">
          <div className='title'>Hielo bolsa 3Kg.</div>
          <h2>125</h2>
          {/* <h3>Bolsas de Hielo 3 Kg.</h3>
          <p>Programado</p> */}
        </div>
        <div className="icon">
          {/* <i class="fa fa-briefcase" aria-hidden="true"></i> */}
          <IconBadge4k size={80}/>
        </div>
      </div>
    </Box>
  )
}

export default Aside