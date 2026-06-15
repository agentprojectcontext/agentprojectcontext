export const STRINGS = {
  en: {
    home: {
      eyebrow: 'Standardized project context for agents',
      title: 'One project. One context layer.',
      leadBefore: 'APC defines a neutral, repository-owned way to store agent-readable project context in a canonical ',
      leadAfter: ' folder. It is designed for AI agents, editors, CLIs, and developer tooling that need a shared understanding of a project.',
      grid: {
        portable: {
          kicker: 'Concept',
          title: 'Portable by default',
          body: 'APC keeps durable context in the repository instead of scattering it across tool-specific folders and private runtime state.'
        },
        scope: {
          kicker: 'Scope',
          title: 'Project-level context',
          body: 'APC covers metadata, agent definitions, skills, curated project memory, and related project conventions. It does not define runtime execution or store private runtime state.'
        },
        interop: {
          kicker: 'Interop',
          title: 'Compatible with MCP',
          body: 'APC and MCP solve different layers. APC standardizes project context. MCP connects agents to external tools and services.'
        }
      },
      principles: ['Portable', 'Project-owned', 'Human-readable', 'Tool-neutral', 'Filesystem-first'],
      note: 'APC documentation in this site is intentionally protocol-oriented. It does not define a runtime, daemon, or vendor-specific workflow.'
    }
  },
  es: {
    home: {
      eyebrow: 'Contexto de proyecto estandarizado para agentes',
      title: 'Un proyecto. Una capa de contexto.',
      leadBefore: 'APC define una forma neutral, propiedad del repositorio, de almacenar contexto de proyecto legible por agentes en una carpeta canónica ',
      leadAfter: '. Está diseñado para agentes de IA, editores, CLIs y herramientas de desarrollo que necesitan un entendimiento compartido de un proyecto.',
      grid: {
        portable: {
          kicker: 'Concepto',
          title: 'Portable por diseño',
          body: 'APC mantiene el contexto durable en el repositorio en lugar de dispersarlo entre carpetas específicas de cada herramienta y estado privado de runtime.'
        },
        scope: {
          kicker: 'Alcance',
          title: 'Contexto a nivel de proyecto',
          body: 'APC cubre metadatos, definiciones de agentes, skills, memoria curada del proyecto y convenciones relacionadas. No define la ejecución en runtime ni almacena estado privado de runtime.'
        },
        interop: {
          kicker: 'Interoperabilidad',
          title: 'Compatible con MCP',
          body: 'APC y MCP resuelven capas distintas. APC estandariza el contexto del proyecto. MCP conecta agentes con herramientas y servicios externos.'
        }
      },
      principles: ['Portable', 'Propiedad del proyecto', 'Legible por humanos', 'Neutral a herramientas', 'Filesystem primero'],
      note: 'La documentación de APC en este sitio está intencionalmente orientada al protocolo. No define un runtime, un daemon, ni un flujo de trabajo específico de un proveedor.'
    }
  }
}

export function getStrings(locale) {
  return STRINGS[locale] || STRINGS.en
}
