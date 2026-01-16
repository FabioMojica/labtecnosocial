// seed.js (versión corregida para evitar duplicados)
import 'reflect-metadata';
import { AppDataSource } from './data-source.js';
import bcrypt from 'bcryptjs';

async function main() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conectado a la base de datos');

    const manager = AppDataSource.manager; 

    // ---------------------------
    // 1) Usuarios (insertar o recuperar si ya existen)
    // ---------------------------
    const hash = async (pwd) => await bcrypt.hash(pwd, 10);

    const userData = [
      {
        firstName: 'Fabio André',
        lastName: 'Mojica Armaza',
        email: 'fabioadmin@gmail.com',
        password: await hash('fabio1A@'),
        role: 'admin',
        state: 'habilitado',
      },
      {
        firstName: 'Pedro',
        lastName: 'Blanco',
        email: 'pedroadmin@gmail.com',
        password: await hash('pedro1A@'),
        role: 'admin',
        state: 'habilitado',
        image_url: 'https://i.pravatar.cc/150?img=12',
      },
      {
        firstName: 'Luis',
        lastName: 'Felipe',
        email: 'luisadmin@gmail.com',
        password: await hash('luis1A@'),
        role: 'admin',
        state: 'habilitado',
        image_url: 'https://i.pravatar.cc/150?img=12',
      },
      {
        firstName: 'Adrian',
        lastName: 'Montes',
        email: 'adrian@gmail.com',
        password: await hash('adrian1A@'),
        role: 'admin',
        state: 'habilitado',
        image_url: 'https://i.pravatar.cc/150?img=12',
      },
      {
        firstName: 'Coordinador',
        lastName: 'Nuevo',
        email: 'nuevocoordinador@gmail.com',
        password: await hash('coordinador1A@'),
        role: 'coordinator',
        state: 'habilitado',
        image_url: 'https://i.pravatar.cc/150?img=12',
      },
      {
        firstName: 'María José',
        lastName: 'Quispe Ramos',
        email: 'mariajose.admin@gmail.com',
        password: await hash('maria1A@'),
        role: 'admin',
        state: 'habilitado',
        image_url: 'https://i.pravatar.cc/150?img=21',
      },
      {
        firstName: 'Carlos Eduardo',
        lastName: 'Rojas Lima',
        email: 'carlos.admin@gmail.com',
        password: await hash('carlos1A@'),
        role: 'admin',
        state: 'habilitado',
        image_url: 'https://i.pravatar.cc/150?img=22',
      },
      {
        firstName: 'Ana Sofía',
        lastName: 'Vargas Peña',
        email: 'ana.vargas@gmail.com',
        password: await hash('ana1A@'),
        role: 'admin',
        state: 'habilitado',
        image_url: 'https://i.pravatar.cc/150?img=23',
      },
      {
        firstName: 'Jorge Luis',
        lastName: 'Mendoza Cruz',
        email: 'jorge.mendoza@gmail.com',
        password: await hash('jorge1A@'),
        role: 'admin',
        state: 'habilitado',
        image_url: 'https://i.pravatar.cc/150?img=24',
      },
      {
        firstName: 'Daniela',
        lastName: 'Flores Aguilar',
        email: 'daniela.flores@gmail.com',
        password: await hash('daniela1A@'),
        role: 'admin',
        state: 'habilitado',
        image_url: 'https://i.pravatar.cc/150?img=25',
      },
      {
        firstName: 'Rodrigo',
        lastName: 'Salinas Ortega',
        email: 'rodrigo.salinas@gmail.com',
        password: await hash('rodrigo1A@'),
        role: 'coordinator',
        state: 'habilitado',
        image_url: 'https://i.pravatar.cc/150?img=26',
      },
      {
        firstName: 'Valeria',
        lastName: 'Gutiérrez Paredes',
        email: 'valeria.gutierrez@gmail.com',
        password: await hash('valeria1A@'),
        role: 'coordinator',
        state: 'habilitado',
        image_url: 'https://i.pravatar.cc/150?img=27',
      },
      {
        firstName: 'Fernando',
        lastName: 'Arce Molina',
        email: 'fernando.arce@gmail.com',
        password: await hash('fernando1A@'),
        role: 'coordinator',
        state: 'habilitado',
        image_url: 'https://i.pravatar.cc/150?img=28',
      },
      {
        firstName: 'Paola',
        lastName: 'Navarro Céspedes',
        email: 'paola.navarro@gmail.com',
        password: await hash('paola1A@'),
        role: 'coordinator',
        state: 'habilitado',
        image_url: 'https://i.pravatar.cc/150?img=29',
      },
      {
        firstName: 'Sebastián',
        lastName: 'Torres Hidalgo',
        email: 'sebastian.torres@gmail.com',
        password: await hash('sebastian1A@'),
        role: 'admin',
        state: 'habilitado',
        image_url: 'https://i.pravatar.cc/150?img=30',
      },

    ];

    const users = [];
    for (const u of userData) {
      // Intento insertar; si ya existe (email único) no falla por ON CONFLICT DO NOTHING
      const inserted = await manager.query(
        `INSERT INTO users ("firstName","lastName", email, password, role, state, image_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (email) DO NOTHING
         RETURNING *`,
        [u.firstName, u.lastName, u.email, u.password, u.role, u.state, u.image_url]
      );

      let row;
      if (inserted && inserted.length > 0) {
        row = inserted[0];
        console.log('👤 Insertado:', row.email);
      } else {
        // Si no devolvió nada, significa que ya existía: lo recuperamos
        const existing = await manager.query('SELECT * FROM users WHERE email=$1', [u.email]);
        row = existing[0];
        console.log('⚠️ Ya existía, recuperado:', row.email);
      }
      users.push(row);
    }

    // ---------------------------
    // 2) Plan estratégico
    // ---------------------------
    const planInsert = await manager.query(
      `INSERT INTO strategic_plans (year, mission)
       VALUES ($1, $2)
       ON CONFLICT (year) DO NOTHING
       RETURNING *`,
      [2025, 'Promover la innovación tecnológica en el ámbito social.']
    );
    let planRow;
    if (planInsert && planInsert.length > 0) {
      planRow = planInsert[0];
    } else {
      planRow = (await manager.query('SELECT * FROM strategic_plans WHERE year=$1', [2025]))[0];
    }
    console.log('📘 Plan estratégico id:', planRow.id);

    // ---------------------------
    // 3) Objetivos
    // ---------------------------
    const objectiveTitles = [
      'Fomentar proyectos de impacto social mediante tecnología.',
      'Desarrollar capacidades técnicas en comunidades locales.',
    ];
    const objectives = [];
    for (const title of objectiveTitles) {
      const ins = await manager.query(
        `INSERT INTO objectives (title, strategic_plan_id)
         VALUES ($1,$2)
         ON CONFLICT DO NOTHING
         RETURNING *`,
        [title, planRow.id]
      );
      let obj;
      if (ins && ins.length > 0) obj = ins[0];
      else obj = (await manager.query('SELECT * FROM objectives WHERE title=$1 AND strategic_plan_id=$2', [title, planRow.id]))[0];
      objectives.push(obj);
    }
    console.log('🎯 Objetivos creados:', objectives.length);

    // ---------------------------
    // 4) Indicadores (por objetivo)
    // ---------------------------
    for (const obj of objectives) {
      await manager.query(
        `INSERT INTO indicators (amount, concept, objective_id)
         VALUES ($1,$2,$3)
         ON CONFLICT DO NOTHING`,
        [Math.floor(Math.random() * 100), 'Indicador de desempeño', obj.id]
      );
    }
    console.log('📊 Indicadores insertados');

    // ---------------------------
    // 5) Programas (por objetivo)
    // ---------------------------
    const programs = [];
    for (const obj of objectives) {
      const ins = await manager.query(
        `INSERT INTO programs (description, objective_id)
         VALUES ($1,$2)
         ON CONFLICT DO NOTHING
         RETURNING *`,
        ['Programa relacionado al objetivo', obj.id]
      );
      let p;
      if (ins && ins.length > 0) p = ins[0];
      else p = (await manager.query('SELECT * FROM programs WHERE objective_id=$1 LIMIT 1', [obj.id]))[0];
      programs.push(p);
    }
    console.log('📚 Programas insertados:', programs.length);

    // ---------------------------
    // 6) Proyectos operacionales (por programa)
    // ---------------------------
    const projects = [];
    for (const program of programs) {
      const ins = await manager.query(
        `INSERT INTO operational_projects (name, description, program_id)
         VALUES ($1,$2,$3)
         ON CONFLICT DO NOTHING
         RETURNING *`,
        [`Proyecto ${program.id}`, `Descripción del proyecto ${program.id}`, program.id]
      );
      let pr;
      if (ins && ins.length > 0) pr = ins[0];
      else pr = (await manager.query('SELECT * FROM operational_projects WHERE program_id=$1 LIMIT 1', [program.id]))[0];
      projects.push(pr);
    }
    console.log('🏗️ Proyectos operacionales insertados:', projects.length);

    // ---------------------------
    // 7) Filas operacionales (por proyecto)
    // ---------------------------
    for (const project of projects) {
      await manager.query(
        `INSERT INTO operational_rows
         (objective, indicator_amount, indicator_concept, team, resources, budget_amount, budget_description, period_start, period_end, operational_project_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT DO NOTHING`,
        [
          `Objetivo del proyecto ${project.id}`,
          100,
          'Porcentaje de avance',
          ['Dev A', 'Dev B'],
          ['PC', 'Servidor'],
          1500,
          'Presupuesto inicial',
          '2025-01-01',
          '2025-12-31',
          project.id,
        ]
      );
    }
    console.log('🧾 Filas operacionales insertadas');

    // ---------------------------
    // 8) Responsables de proyecto
    // ---------------------------
    // Ya insertamos/tenemos users[] arriba; elegimos el primer admin disponible
    const adminUser = users.find((u) => u.role === 'admin');
    if (!adminUser) throw new Error("No se encontró usuario admin en users[]");

    for (const project of projects) {
      // comprobar si ya existe la fila
      const exists = await manager.query(
        `SELECT 1 FROM project_responsibles WHERE user_id=$1 AND operational_project_id=$2 LIMIT 1`,
        [adminUser.id, project.id]
      );
      if (exists.length === 0) {
        await manager.query(
          `INSERT INTO project_responsibles (user_id, operational_project_id)
           VALUES ($1,$2)`,
          [adminUser.id, project.id]
        );
      }
    }
    console.log('👥 Responsables de proyecto insertados');

    // ---------------------------
    // 9) Integraciones
    // ---------------------------
    for (const project of projects) {
      const exists = await manager.query(
        `SELECT 1 FROM project_integrations WHERE project_id=$1 LIMIT 1`,
        [project.id]
      );
      if (exists.length === 0) {
        await manager.query(
          `INSERT INTO project_integrations (platform, integration_id, name, url, project_id)
           VALUES ($1,$2,$3,$4,$5)`,
          ['github', `repo-${project.id}`, 'Repositorio principal', `https://github.com/univalle/project-${project.id}`, project.id]
        );
      }
    }
    console.log('🔗 Integraciones insertadas');

    console.log('🌱 Seed completado ✅');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error ejecutando seed:', err);
    try { await AppDataSource.destroy(); } catch (e) { }
    process.exit(1);
  }
}

main();
