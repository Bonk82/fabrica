import { Inter } from "next/font/google";
import "./globals.css";
import '@mantine/core/styles.css';

import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { AuthProvider } from "./context/AuthContext";
import { SupabaseContextProvider } from "./context/SupabaseContext";


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Iceland",
  description: "Aplicación para ventas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      {/* <body className={inter.className}>{children}</body> */}
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider defaultColorScheme="dark" theme={{primaryColor:'cyan'}}>
          {/* <Model>{children}</Model> */}
          <AuthProvider>
            <SupabaseContextProvider>
              {children}
            </SupabaseContextProvider>
          </AuthProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
