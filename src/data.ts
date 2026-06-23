import { Empresa, Residencia, Planeamento, IntervencaoHistorico } from './types';

export const INITIAL_EMPRESAS: Empresa[] = [];

const RESIDENCIAS_RAW = [
  // ZONA BEIRA
  { nome: "Sister Nica", bairro: "ZONA BEIRA", endereco: "Macuti — Casa Nr. 1878", tel: "+258 84 000 0001" },
  { nome: "Macurungo Resident", bairro: "ZONA BEIRA", endereco: "Macurungo 1 — Casa de Sister Mazembe", tel: "+258 84 000 0002" },
  { nome: "Sr. Lucas", bairro: "ZONA BEIRA", endereco: "Macurungo 2", tel: "+258 84 024 5566" },
  { nome: "Casa do Secretário", bairro: "ZONA BEIRA", endereco: "Baixa Beira — Pontageia", tel: "+258 85 822 2007" },
  { nome: "Casa do Secretário", bairro: "ZONA BEIRA", endereco: "Matacuane 2 — Pontageia", tel: "+258 85 822 2007" },
  { nome: "Irmão Elder", bairro: "ZONA BEIRA", endereco: "Matacuane 1 — Monumento", tel: "+258 84 000 0006" },
  
  // ZONA MUNHAVA
  { nome: "Irmão Elder", bairro: "ZONA MUNHAVA", endereco: "Casa de Aeroporto", tel: "+258 84 000 0007" },
  { nome: "Irmão Elder", bairro: "ZONA MUNHAVA", endereco: "Casa de Mascarenhas", tel: "+258 84 000 0008" },
  { nome: "Irmão Elder Nhavence", bairro: "ZONA MUNHAVA", endereco: "Pioneiro — Pinamala", tel: "+258 85 801 8643" },
  { nome: "Manganhe Resident", bairro: "ZONA MUNHAVA", endereco: "Maganhe", tel: "+258 85 802 1083" },
  { nome: "Irmão Elder", bairro: "ZONA MUNHAVA", endereco: "Chota 1", tel: "+258 84 000 0011" },
  { nome: "Irmão Elder", bairro: "ZONA MUNHAVA", endereco: "Chota 2 — Palmeiras", tel: "+258 84 000 0012" },

  // ZONA MANGA
  { nome: "Irmão Elder Nascimento", bairro: "ZONA MANGA", endereco: "Casa Vila Massane", tel: "+258 85 801 5017" },
  { nome: "Sister Tiaco", bairro: "ZONA MANGA", endereco: "Nhanconjo 1 — Rua 2 Perto de Fipag", tel: "+258 84 310 8183" },
  { nome: "Irmão Elder", bairro: "ZONA MANGA", endereco: "Nhanconjo 2", tel: "+258 84 982 7544" },
  { nome: "Irmão Elder", bairro: "ZONA MANGA", endereco: "Casa de Chingussura", tel: "+258 84 010 3306" },
  { nome: "Irmão Elder", bairro: "ZONA MANGA", endereco: "Casa de Chamba (R/C e 1º andar)", tel: "+258 85 801 5015" },
  { nome: "Irmão Elder", bairro: "ZONA MANGA", endereco: "Casa de Massange", tel: "+258 85 801 5016" },

  // ZONA INHAMIZUA
  { nome: "Irmão Elder", bairro: "ZONA INHAMIZUA", endereco: "Inhamizua 1", tel: "+258 84 000 0019" },
  { nome: "Irmão Elder", bairro: "ZONA INHAMIZUA", endereco: "Inhamizua 2", tel: "+258 84 000 0020" },
  { nome: "Irmão Elder", bairro: "ZONA INHAMIZUA", endereco: "Inhamizua 3", tel: "+258 84 000 0021" },
  { nome: "Irmão Elder", bairro: "ZONA INHAMIZUA", endereco: "Dondo 1", tel: "+258 84 879 2722" },
  { nome: "Irmão Elder", bairro: "ZONA INHAMIZUA", endereco: "Dondo 2", tel: "+258 85 801 4575" },
  { nome: "Irmão Elder Festas", bairro: "ZONA INHAMIZUA", endereco: "Mafambisse", tel: "+258 84 600 1464" },
  { nome: "Irmão Elder", bairro: "ZONA INHAMIZUA", endereco: "Casa de Zona Verde", tel: "+258 84 000 0025" },

  // ZONA CHIMOIO
  { nome: "Irmão Elder", bairro: "ZONA CHIMOIO", endereco: "Casa de Tambara Chimoio", tel: "+258 84 023 8559" },
  { nome: "Irmão Elder", bairro: "ZONA CHIMOIO", endereco: "Casa da Baixa Chimoio", tel: "+258 84 600 2913" },
  { nome: "Irmão Elder", bairro: "ZONA CHIMOIO", endereco: "Casa de Gondola", tel: "+258 85 801 4578" },
  { nome: "Irmão Elder", bairro: "ZONA CHIMOIO", endereco: "Casa de Chimoio 4 (Bairro 4)", tel: "+258 84 023 9694" },
  { nome: "Irmão Elder", bairro: "ZONA CHIMOIO", endereco: "Casa de Chimoio 2 (Bairro 4)", tel: "+258 84 600 9711" },
  { nome: "Irmão Elder", bairro: "ZONA CHIMOIO", endereco: "Casa de Centro Hípico", tel: "+258 84 946 5582" },
  { nome: "Irmão Elder", bairro: "ZONA CHIMOIO", endereco: "Casa de 7 de Abril", tel: "+258 84 212 0490" },
  { nome: "Irmão Elder", bairro: "ZONA CHIMOIO", endereco: "Casa de Soalpo", tel: "+258 84 304 6504" },
  { nome: "Irmão Elder", bairro: "ZONA CHIMOIO", endereco: "Nhamatanda", tel: "+258 84 399 8512" },

  // ZONA TETE
  { nome: "Irmão Elder", bairro: "ZONA TETE", endereco: "Casa de Tete 1", tel: "+258 84 024 3485" },
  { nome: "Irmão Elder", bairro: "ZONA TETE", endereco: "Casa de Tete 2", tel: "+258 84 600 6302" },
  { nome: "Irmão Elder", bairro: "ZONA TETE", endereco: "Casa de Matundo", tel: "+258 84 600 3218" },
  { nome: "Irmão Elder", bairro: "ZONA TETE", endereco: "Casa de Moatize", tel: "+258 84 540 1832" }
];

export function gerarResidenciasIniciais(): Residencia[] {
  const residencias: Residencia[] = [];
  
  for (let i = 0; i < RESIDENCIAS_RAW.length; i++) {
    const raw = RESIDENCIAS_RAW[i];
    const idNum = i + 1;
    const codigo = `EXO-${100 + idNum}`;
    
    // Dia da fumigação em maio correspondente (de 21 a 28)
    const diaMaio = 21 + (i % 8);
    const ultimaFumigacao = `2026-05-${String(diaMaio).padStart(2, '0')}`;

    residencias.push({
      id: `RES-${String(idNum).padStart(3, '0')}`,
      codigo,
      nomeOcupante: raw.tel, // Apenas o contacto (sem colocar o nome da pessoa)
      telefonePrincipal: raw.tel,
      telefoneAlternativo: raw.tel,
      bairro: raw.bairro,
      endereco: raw.endereco,
      observacoesGerais: "",
      estadoFumigacao: 'Pendente', // Sem registo activo ainda na campanha corrente
      estadoACS: 'Pendente',        // Sem registo activo ainda na campanha corrente
      ultimaFumigacao,             // Fumigadas no mês de Maio
      ultimaACS: 'Nenhuma',
      empresaId: '',               // Nenhuma atribuída por padrão (para adicionar reais)
    });
  }
  
  return residencias;
}

export function gerarPlaneamentosIniciais(): Planeamento[] {
  return []; // Sem nenhum registo planeado no início
}

export function gerarHistoricoInicial(): IntervencaoHistorico[] {
  const historico: IntervencaoHistorico[] = [];
  const residencias = gerarResidenciasIniciais();
  
  for (let i = 0; i < residencias.length; i++) {
    const res = residencias[i];
    const diaMaio = 21 + (i % 8); // De 21 a 28 de maio
    const dataHora = `2026-05-${String(diaMaio).padStart(2, '0')} ${String(9 + (i % 8)).padStart(2, '0')}:${String(10 * (i % 6)).padStart(2, '0')}:00`;
    
    historico.push({
      id: `HIST-${String(i + 1).padStart(3, '0')}`,
      residenciaId: res.id,
      residenciaCodigo: res.codigo,
      residenciaNome: res.nomeOcupante, // Telemóvel do contacto
      tipo: 'Fumigação',
      dataHora,
      estadoAnterior: 'Agendada',
      estadoNovo: 'Concluída',
      observacoes: '', // Sem observações para iniciar limpo
      utilizadorResponsavel: 'Administração Exofix',
    });
  }
  
  return historico;
}

// Inicializar e guardar dados nos cookies/localStorage para persistência duradoura
export function obterDadosIniciais() {
  if (localStorage.getItem('exofix_seed_version') !== '5') {
    localStorage.removeItem('exofix_residencias');
    localStorage.removeItem('exofix_empresas');
    localStorage.removeItem('exofix_planeamentos');
    localStorage.removeItem('exofix_historico');
    localStorage.setItem('exofix_seed_version', '5');
  }

  const residenciasLS = localStorage.getItem('exofix_residencias');
  const empresasLS = localStorage.getItem('exofix_empresas');
  const planeamentosLS = localStorage.getItem('exofix_planeamentos');
  const historicoLS = localStorage.getItem('exofix_historico');

  let residencias: Residencia[] = [];
  let empresas: Empresa[] = [];
  let planeamentos: Planeamento[] = [];
  let historico: IntervencaoHistorico[] = [];

  if (!residenciasLS) {
    residencias = gerarResidenciasIniciais();
    localStorage.setItem('exofix_residencias', JSON.stringify(residencias));
  } else {
    residencias = JSON.parse(residenciasLS);
  }

  if (!empresasLS) {
    empresas = INITIAL_EMPRESAS;
    localStorage.setItem('exofix_empresas', JSON.stringify(empresas));
  } else {
    empresas = JSON.parse(empresasLS);
  }

  if (!planeamentosLS) {
    planeamentos = gerarPlaneamentosIniciais();
    localStorage.setItem('exofix_planeamentos', JSON.stringify(planeamentos));
  } else {
    planeamentos = JSON.parse(planeamentosLS);
  }

  if (!historicoLS) {
    historico = gerarHistoricoInicial();
    localStorage.setItem('exofix_historico', JSON.stringify(historico));
  } else {
    historico = JSON.parse(historicoLS);
  }

  return { residencias, empresas, planeamentos, historico };
}

export function salvarDados(data: {
  residencias: Residencia[];
  empresas: Empresa[];
  planeamentos: Planeamento[];
  historico: IntervencaoHistorico[];
}) {
  localStorage.setItem('exofix_residencias', JSON.stringify(data.residencias));
  localStorage.setItem('exofix_empresas', JSON.stringify(data.empresas));
  localStorage.setItem('exofix_planeamentos', JSON.stringify(data.planeamentos));
  localStorage.setItem('exofix_historico', JSON.stringify(data.historico));
}

export function resetarDados() {
  localStorage.removeItem('exofix_residencias');
  localStorage.removeItem('exofix_empresas');
  localStorage.removeItem('exofix_planeamentos');
  localStorage.removeItem('exofix_historico');
  localStorage.removeItem('exofix_user');
  return obterDadosIniciais();
}

export function sincronizarEstadosResidencias(
  residencias: Residencia[],
  planeamentos: Planeamento[],
  dataHoje: string = '2026-06-22'
): Residencia[] {
  return residencias.map(res => {
    // Procurar planejamentos para esta residência
    const planFum = planeamentos.find(p => p.tipo === 'Fumigação' && p.residenciaIds.includes(res.id));
    const planACS = planeamentos.find(p => p.tipo === 'Manutenção ACS' && p.residenciaIds.includes(res.id));

    let estadoFumigacao = res.estadoFumigacao;
    let estadoACS = res.estadoACS;

    // Regras de Sincronização Automática para Fumigação
    if (estadoFumigacao !== 'Concluída' && estadoFumigacao !== 'Em andamento' && estadoFumigacao !== 'Não realizada') {
      if (planFum) {
        if (planFum.data < dataHoje) {
          estadoFumigacao = 'Atrasada';
        } else {
          estadoFumigacao = 'Agendada';
        }
      } else {
        estadoFumigacao = 'Pendente';
      }
    } else if (estadoFumigacao === 'Agendada' || estadoFumigacao === 'Atrasada' || estadoFumigacao === 'Pendente') {
      if (planFum) {
        if (planFum.data < dataHoje) {
          estadoFumigacao = 'Atrasada';
        } else {
          estadoFumigacao = 'Agendada';
        }
      } else {
        estadoFumigacao = 'Pendente';
      }
    }

    // Regras de Sincronização Automática para ACS
    if (estadoACS !== 'Concluída' && estadoACS !== 'Em andamento' && estadoACS !== 'Não realizada') {
      if (planACS) {
        if (planACS.data < dataHoje) {
          estadoACS = 'Atrasada';
        } else {
          estadoACS = 'Agendada';
        }
      } else {
        estadoACS = 'Pendente';
      }
    } else if (estadoACS === 'Agendada' || estadoACS === 'Atrasada' || estadoACS === 'Pendente') {
      if (planACS) {
        if (planACS.data < dataHoje) {
          estadoACS = 'Atrasada';
        } else {
          estadoACS = 'Agendada';
        }
      } else {
        estadoACS = 'Pendente';
      }
    }

    return {
      ...res,
      estadoFumigacao,
      estadoACS
    };
  });
}

