import { useRouter } from 'next/navigation';
import { useSupa } from '../context/SupabaseContext';
import { Button } from '@mantine/core';
import { IconUsersGroup,IconBuildingFactory2,IconBriefcase,IconUserCog,IconUserCheck,IconTimeline,IconBusinessplan } from '@tabler/icons-react';


const Navbar = () => {
  const { menu} = useSupa();
  const menues = menu.sort((a,b)=>a.orden-b.orden);
  console.log('en navbar',menu);
  const router = useRouter()

  const navegar = (url) =>{
    if(url) router.push(url);
  }

  const icons = [
    <IconBuildingFactory2 key={1}/>,
    <IconUsersGroup key={0}/>,
    <IconBriefcase key={2} />,
    <IconUserCog key={3} />,
    <IconBusinessplan key={6} />,
    <IconUserCheck key={4} />,
    <IconTimeline key={5} />,
  ]

  return (
    <div style={{textAlign:'left'}}>
      {menues.map((e,i)=>(
        <Button key={e.id_menu}
          leftSection={icons[i]}
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