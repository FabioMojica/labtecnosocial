import { useState, useRef } from "react";

export const useResponsiblesPanel = (
  initialResponsibles,
  allUsers,
  onChange
) => {
  const [projectResponsibles, setProjectResponsibles] = useState(initialResponsibles);
  const [preEliminados, setPreEliminados] = useState([]);
  const [preAnadidos, setPreAnadidos] = useState([]);
  const initialRef = useRef(initialResponsibles);


 const notifyParent = (updatedProjectResponsibles, updatedPreEliminados, updatedPreAnadidos) => {
        if (onChange) {
            onChange({
                projectResponsibles: updatedProjectResponsibles,
                preEliminados: updatedPreEliminados,
                preAnadidos: updatedPreAnadidos
            });
        }
    };

//   const removeResponsible = (user: UserWithProjectCount) => {
//     const updatedProjectResponsibles = projectResponsibles.filter(r => r.id !== user.id);
//     const updatedPreEliminados = [...preEliminados, user];
//     setProjectResponsibles(updatedProjectResponsibles);
//     setPreEliminados(updatedPreEliminados);
//     notifyParent(updatedProjectResponsibles, updatedPreEliminados, preAnadidos);
//   };

//  const removeResponsible = (user: UserWithProjectCount) => {
//         const updatedProjectResponsibles = projectResponsibles.filter(r => r.id !== user.id);
//         const updatedPreEliminados = [...preEliminados, user];
//         setProjectResponsibles(updatedProjectResponsibles);
//         setPreEliminados(updatedPreEliminados);
//         notifyParent(updatedProjectResponsibles, updatedPreEliminados, preAnadidos);
//         // notify(`${user.firstName} ${user.lastName} se movió a pre eliminados`, "info");
//     };

   const removeResponsible = (user) => {

        const updatedProjectResponsibles = projectResponsibles.filter(r => r.id !== user.id);
        const updatedPreEliminados = [...preEliminados, user];
        setProjectResponsibles(updatedProjectResponsibles);
        setPreEliminados(updatedPreEliminados);
        notifyParent(updatedProjectResponsibles, updatedPreEliminados, preAnadidos);
        // notify(`${user.firstName} ${user.lastName} se movió a pre eliminados`, "info");
    };


//   const restoreResponsible = (user: UserWithProjectCount) => {
//     const updatedPreEliminados = preEliminados.filter(r => r.id !== user.id);
//     const updatedProjectResponsibles = [...projectResponsibles, user];
//     setProjectResponsibles(updatedProjectResponsibles);
//     setPreEliminados(updatedPreEliminados);
//     notifyParent(updatedProjectResponsibles, updatedPreEliminados, preAnadidos);
//   };

 const restoreResponsible = (user) => {
        const updatedPreEliminados = preEliminados.filter(r => r.id !== user.id);
        const updatedProjectResponsibles = [...projectResponsibles, user];

        setPreEliminados(updatedPreEliminados);
        setProjectResponsibles(updatedProjectResponsibles);

        notifyParent(updatedProjectResponsibles, updatedPreEliminados, preAnadidos);

        //notify(`${user.firstName} ${user.lastName} se movió a responsables del proyecto`, "success");
    };

//   const addPreResponsible = (user: UserWithProjectCount) => {
//     const updatedPreAnadidos = [...preAnadidos, user];
//     setPreAnadidos(updatedPreAnadidos);
//     notifyParent(projectResponsibles, preEliminados, updatedPreAnadidos);
//   };


//   const removePreResponsible = (user: UserWithProjectCount) => {
//     const updatedPreAnadidos = preAnadidos.filter(r => r.id !== user.id);
//     setPreAnadidos(updatedPreAnadidos);
//     notifyParent(projectResponsibles, preEliminados, updatedPreAnadidos);
//   };
const removePreResponsible = (user) => {
        setPreAnadidos(prev => {
            const updatedPreAnadidos = prev.filter(r => r.id !== user.id);

            notifyParent(projectResponsibles, preEliminados, updatedPreAnadidos);

            return updatedPreAnadidos;
        });

        //notify(`${user.firstName} ${user.lastName} se removió de pre añadidos`, "info");
    };

    
    const addPreResponsible = (user) => {
        setPreAnadidos(prev => {
            const updatedPreAnadidos = [...prev, user];

            notifyParent(projectResponsibles, preEliminados, updatedPreAnadidos);

            return updatedPreAnadidos;
        });

        //notify(`${user.firstName} ${user.lastName} se añadió a pre añadidos`, "success");
    };

  const reset = () => {
    setProjectResponsibles(structuredClone(initialRef.current));
    setPreEliminados([]);
    setPreAnadidos([]);
  };

  return {
    projectResponsibles,
    preEliminados,
    preAnadidos,
    removeResponsible,
    restoreResponsible,
    addPreResponsible,
    removePreResponsible,
    reset
  };
};