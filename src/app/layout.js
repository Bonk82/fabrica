import { Inter } from "next/font/google";
import "./globals.css";
import '@mantine/core/styles.css';

import { ColorSchemeScript, MantineProvider } from '@mantine/core';


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
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
