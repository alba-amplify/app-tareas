import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amplify Tareas",
  description: "Panel de tareas del equipo Amplify",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Dentro del panel (iframe) las páginas se muestran sin su cabecera ni pestañas. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(window.self!==window.top||new URLSearchParams(location.search).get('embed')==='1')document.documentElement.classList.add('embedded')}catch(e){document.documentElement.classList.add('embedded')}",
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
