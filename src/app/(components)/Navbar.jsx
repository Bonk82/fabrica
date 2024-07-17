import { useRouter } from 'next/navigation';
import { useSupa } from '../context/SupabaseContext';
import { Button } from '@mantine/core';
import { IconUsersGroup,IconBuildingFactory2,IconBriefcase,IconUserCog,IconUserCheck,IconTimeline,IconBusinessplan,IconListCheck, IconTools } from '@tabler/icons-react';


const Navbar = () => {
  const { menu,usuario} = useSupa();
  const menues = menu.filter(f=>f.rol==usuario.rol).sort((a,b)=>a.orden-b.orden);
  console.log('en navbar',menu,usuario);
  const router = useRouter()

  const navegar = (url) =>{
    if(url) router.push(url);
  }

  const icons = [
    <IconUsersGroup key={1}/>,
    <IconBuildingFactory2 key={2}/>,
    <IconBriefcase key={3} />,
    <IconUserCog key={4} />,
    <IconUserCheck key={5} />,
    <IconTimeline key={6} />,
    <IconBusinessplan key={7} />,
    <IconListCheck key={8} />,
    <IconTools key={9} />,
  ]

  return (
    <div style={{textAlign:'left'}}>
      {menues.map((e,i)=>(
        <Button key={e.id_menu}
          leftSection={icons[e.id_menu]}
          onClick={()=>navegar(e.ruta)}
          fullWidth style={{marginBottom:'1rem'}}
          justify='flex-start'
          variant='light'
        >
          {e.descripcion}
        </Button>
      ))}
    </div>
  )
}

export default Navbar