'use client'
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { useRouter } from "next/navigation";

export const SupaContext = createContext();

export const useSupa = () => {
  const context = useContext(SupaContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
};

// eslint-disable-next-line react/prop-types
export const SupabaseContextProvider = ({ children }) => {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [transacciones, setTransacciones] = useState([]);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState('');
  const [usuario, setUsuario] = useState(null);
  const router = useRouter()
  
  useEffect(()=>{
    getUser();
    // if(!usuario) router.push('/login')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  const loginWithMagicLink = async (email) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signIn({ email });
      if (error) {
        throw error;
      }
      console.log("revisa tu correo para usar el enlace de registro");
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  const singUpWithPassword = async (email,password)=>{
    const {data,error} = await supabase.auth.signUp({
      email,
      password
    })
    console.log(data,error),email,password;
  }

  const signInWithEmail = async(email,password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if(data.user){
      setUsuario(data.user)
      router.push('/dashboard')
    } 
    console.log(data,error);
  };

  const signInWithGoogle = async ()=> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    console.log(data,error);
  }

  const logout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error) {
      console.log(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  const getUser = async () =>{
    try {
      const pivotUser = await supabase.auth.getUser();
      console.log('ingresando',pivotUser);
      if(!pivotUser.data.user) router.push('/login')
      pivotUser.data.user?.identities.forEach(e => {
        e.identity_data.picture ? setAvatar(e.identity_data.picture):'C'
        // console.log('entroEach',avatar);
      });

      // pivotUser.data.user.email === 'bonkalvarado@gmail.com' ? pivotUser.data.user.rol =  'ADMIN': 'USUARIO';
      if (pivotUser.data.user){
        getReg('vw_menu_rol','id_menu','asc')
        setUsuario(pivotUser.data.user)
      } 
    } catch (error) {
      console.log('erro al cargar usuario',error);
    }
  }

  const createReg = async (reg,table) => {
    setLoading(true);
    try {
      const { error, data } = await supabase.from(table).insert(reg).select();
      console.log('llega aca',error,data,reg,table);
      if (error) throw new Error(error.message);
      if(!error && table == 'cliente') setClientes(data);
    } catch (error) {
      console.log(error.error_description || error.message || error);
      throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getReg = async (table,col,ascending) => {
    try {
      setLoading(true);
      supabase.schema('seguridad')
      const {data, error}  = await supabase
        .from(table)
        .select("*")
        .order(col, { ascending})
      console.log(table,data,error);
      if (error) throw new Error(error.message);
      if(table == 'cliente') setClientes(data);
      if(table == 'vw_menu_rol') setMenu(data);
      // if(['prestamo','vw_prestamos'].includes(table)) setProductos(data);
      return data;
    } catch (error) {
      console.log(error.error_description || error.message || error);
      throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateReg = async (tabla, updatedFields) => {
    try {
      setLoading(true);
      // const user = supabase.auth.user();
      console.log('actualizando',updatedFields);
      const { error, data } = await supabase
        .from(tabla)
        .update(updatedFields)
        .eq("id_"+tabla, updatedFields.id)
      if (error) throw new Error(error.message);
      console.log(error,data);
    } catch (error) {
      console.log(error.error_description || error.message || error);
      throw new Error(error.message);
    } finally {
      setLoading(false)
    }
  };

  const deleteReg = async (tabla,id) => {
    console.log('deletereg',tabla,id);
    try {
      setLoading(true)
      const {error} = await supabase
        .from(tabla)
        .delete()
        .eq("id_"+tabla, id);
      if (error) throw error;
      setClientes(clientes.filter(c => c.id !== id));
    } catch (error) {
      console.log(error.error_description || error.message);
    } finally {
      setLoading(false)
    }
  };

  return (
    <SupaContext.Provider
      value={{
        clientes,
        productos,
        proveedores,
        pedidos,
        cuentas,
        transacciones,
        loading,
        loginWithMagicLink,
        singUpWithPassword,
        signInWithEmail,
        signInWithGoogle,
        logout,
        getUser,
        avatar,
        usuario,
        menu,
        createReg,
        getReg,
        updateReg,
        deleteReg,
      }}
    >
      {children}
    </SupaContext.Provider>
  );
};