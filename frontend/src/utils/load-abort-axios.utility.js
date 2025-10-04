/* Observable cada comunicacion se suscribe, si se emite una señal por este
   canal, cancela la peticion en curso, si un componente deja de existir es muy util usar esto
   por que si una llamada se hizo desde un componente inexistente es innecesario esperar que 
   la llamada termine
*/
export const loadAbort = () => {
    const controller = new AbortController();
    return controller;
}