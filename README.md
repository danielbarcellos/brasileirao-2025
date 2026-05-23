# 🏆 Campeonato Brasileiro 2025 - Simulador

Um sistema completo para simular e acompanhar o Campeonato Brasileiro 2025, com classificação em tempo real e simulador de partidas.

## ✨ Funcionalidades

- 📊 Tabela de classificação com todas as estatísticas (PJ, VIT, E, DER, GM, GC, SG, PTS)
- 🎮 Simulador de partidas por rodada
- 🎲 Resultados realistas com geração aleatória
- 🎨 Interface moderna e responsiva
- 💾 Persistência de dados (JSON ou SQLite)
- 🏅 Destaques visuais para G4, G6 e zona de rebaixamento

## 🚀 Tecnologias Utilizadas

### Frontend
- React 18
- Axios
- CSS3 moderno (Flexbox, Grid)

### Backend
- Node.js
- Express
- SQLite / JSON File Storage (sem necessidade de banco externo)

## 📦 Como Executar

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/brasileirao-2025.git
cd brasileirao-2025
```
2. Instale as dependências do backend:
```bash
cd backend
npm install
```
3. Instale as dependências do frontend:
```bash
cd ../frontend
npm install
```

4. Execute o backend:
```bash
cd ../frontend
npm install
```
5. Em outro terminal, execute o frontend:
```bash
cd frontend
npm start
```
6. Acesse http://localhost:3000

## 🎮 Como Usar

- Ao iniciar, clique em "Reiniciar Campeonato" para gerar os times e partidas
- Selecione uma rodada no simulador
- Clique em "Simular Rodada" para gerar os resultados
- Acompanhe a classificação sendo atualizada automaticamente

## 📁 Estrutura do Projeto

```text
brasileirao-2025/
├── backend/
│   ├── server.js          # API principal
│   ├── database.js        # Configuração SQLite (opcional)
│   ├── storage.js         # Storage JSON (opcional)
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── StandingsTable.js
│   │   │   ├── StandingsTable.css
│   │   │   ├── MatchSimulator.js
│   │   │   └── MatchSimulator.css
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## 🔧 Configuração

O projeto pode usar dois tipos de armazenamento:

### JSON Storage (padrão)

Não requer instalação adicional

Dados salvos em backend/data.json

### SQLite (alternativo)



## 🎨 Funcionalidades Visuais

- Campeão: Destaque dourado 🏆
- Libertadores (G4): Fundo verde claro
- Pré-Libertadores: Fundo azul claro
- Rebaixamento: Fundo vermelho claro

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para:

- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests

## 📝 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

Daniel Ribeiro - [GitHub](https://github.com/danielbarcellos)

