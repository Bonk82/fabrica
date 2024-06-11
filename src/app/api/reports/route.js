import carbone from 'carbone';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request) {
  // Obtener los parámetros de la consulta
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get('tipo') || 'world';

  const data = { message: `Hello, ${tipo}!` };

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// export async function POST(request) {
//   try {
//     const body = await request.json(); // Parsear el cuerpo de la solicitud

//     // Puedes realizar alguna lógica con los datos recibidos aquí
//     console.log('el body',body,request.body); // Por ejemplo, imprimir los datos en el servidor

//     return new Response(JSON.stringify({ message: "Data received successfully", data: body }), {
//       status: 200,
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });
//   } catch (error) {
//     return new Response(JSON.stringify({ message: "Failed to process data" }), {
//       status: 500,
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });
//   }
// }

export async function POST(request) {
  try {
    const { templateData, data } = await request.json();

    console.log('en back',templateData,data);

    // Ruta a la plantilla en el servidor
    const templatePath = path.join(process.cwd(), 'src/templates', 'reporte01.docx' /*templateData.filename*/);

    // Leer la plantilla del sistema de archivos
    // const template = await fs.readFile(templatePath);

    // Verificar que la plantilla exista y leerla como un buffer
    let pathTemplate;
    try {
      pathTemplate = await fs.readFile(templatePath);
    } catch (err) {
      throw new Error('Template file does not exist or cannot be read');
    }
    const options = {
      // convertTo : 'pdf', //can be docx, txt, ...
      reportName: `mireporte_` + new Date().getTime() + '.docx',
      lang: 'es',
      timezone:'America/Caracas',
    };

    // Generar el reporte usando carbone.render
    return new Promise((resolve, reject) => {
      console.log('antes del promise',data);
      carbone.render(templatePath, data,options, (err, buffer, filename) => {
        if (err) {
          console.error('con error',data);
          console.error('Error generating report:', err);
          reject(new Response(JSON.stringify({ message: 'Error generating report' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }));
        } else {
          console.log('mira el resultado',buffer);
          resolve(new Response(Buffer.from(buffer, 'binary'), {
            status: 200,
            // headers: {
            //   // 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Ajusta el tipo MIME según el formato de tu reporte
            //   // 'Content-Disposition': 'attachment; filename="report.xlsx"',

            //   // 'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Tipo MIME para DOCX
            //   // 'Content-Disposition': 'attachment; filename="report.docx"', // Nombre del archivo para la descarga

            //   'Content-Type': 'application/pdf', // Tipo MIME para DOCX
            //   'Content-Disposition': 'attachment; filename="report.pdf"', // Nombre del archivo para la descarga
            // },
          }));
        }
      });
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ message: 'Error processing request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
