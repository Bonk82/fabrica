import Image from "next/image";
import styles from "./page.module.css";
import { Text } from "@mantine/core";

export default function Home() {
  return (
    <main className={styles.main}>
      <Text c="cyan.4" size='100px' fw={1200}
          variant="gradient"
          gradient={{ from: 'lightblue', to: 'cyan', deg: 90 }}>
          Cristales Ice 
        </Text>
    </main>
  );
}
