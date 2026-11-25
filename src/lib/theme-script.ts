// Sin "use client": lo importan tanto el layout (servidor) como el hook del tema (cliente).
export const THEME_STORAGE_KEY = "theme";

/** Script que corre antes del primer pintado para evitar el parpadeo claro→oscuro. */
export const THEME_INIT_SCRIPT = `try{if(localStorage.getItem("${THEME_STORAGE_KEY}")==="dark")document.documentElement.classList.add("dark")}catch(e){}`;
