import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('colorassist.db');

export type Usuario = {
  id: number;
  nome: string;
  email: string;
  tipo_daltonismo?: string | null;
};

export function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL,
      tipo_daltonismo TEXT DEFAULT 'Não sei informar'
    );

    CREATE TABLE IF NOT EXISTS pecas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      nome TEXT NOT NULL,
      tipo TEXT,
      imagem_uri TEXT,
      cor_detectada TEXT,
      paleta TEXT,
      imagem_resultado TEXT,
      data_cadastro TEXT,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    );
  `);

  const colunasUsuarios = db.getAllSync<{ name: string }>('PRAGMA table_info(usuarios)');
  const temTipoDaltonismo = colunasUsuarios.some(
    (coluna) => coluna.name === 'tipo_daltonismo'
  );

  if (!temTipoDaltonismo) {
    db.execSync(
      "ALTER TABLE usuarios ADD COLUMN tipo_daltonismo TEXT DEFAULT 'Não sei informar'"
    );
  }
}

export function cadastrarUsuario(
  nome: string,
  email: string,
  senha: string,
  tipoDaltonismo = 'Não sei informar'
) {
  const statement = db.prepareSync(
    'INSERT INTO usuarios (nome, email, senha, tipo_daltonismo) VALUES (?, ?, ?, ?)'
  );

  try {
    statement.executeSync([nome, email, senha, tipoDaltonismo]);
  } finally {
    statement.finalizeSync();
  }
}

export function garantirUsuarioDemonstracao() {
  const usuarioDemo = db.getFirstSync<Usuario>(
    'SELECT id, nome, email FROM usuarios WHERE email = ?',
    ['demo@colorassist.com']
  );

  if (usuarioDemo) {
    return;
  }

  cadastrarUsuario('Usuário Demonstração', 'demo@colorassist.com', '123456');
}

export function buscarUsuarioPorEmailSenha(email: string, senha: string) {
  const usuario = db.getFirstSync<Usuario>(
    'SELECT id, nome, email, tipo_daltonismo FROM usuarios WHERE email = ? AND senha = ?',
    [email, senha]
  );

  return usuario;
}

export function atualizarTipoDaltonismoUsuario(
  usuarioId: number,
  tipoDaltonismo: string
) {
  const statement = db.prepareSync(
    'UPDATE usuarios SET tipo_daltonismo = ? WHERE id = ?'
  );

  try {
    statement.executeSync([tipoDaltonismo, usuarioId]);
  } finally {
    statement.finalizeSync();
  }
}

export function cadastrarPeca(
  usuarioId: number,
  nome: string,
  tipo: string,
  imagemUri: string | null,
  corDetectada: string | null,
  paleta: string | null,
  imagemResultado: string | null
) {
  const dataCadastro = new Date().toLocaleDateString('pt-BR');

  const statement = db.prepareSync(
    `INSERT INTO pecas 
    (usuario_id, nome, tipo, imagem_uri, cor_detectada, paleta, imagem_resultado, data_cadastro)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  try {
    statement.executeSync([
      usuarioId,
      nome,
      tipo,
      imagemUri,
      corDetectada,
      paleta,
      imagemResultado,
      dataCadastro,
    ]);
  } finally {
    statement.finalizeSync();
  }
}

export function listarPecas(usuarioId: number) {
  const pecas = db.getAllSync(
    'SELECT * FROM pecas WHERE usuario_id = ? ORDER BY id DESC',
    [usuarioId]
  );

  return pecas;
}

export function excluirPeca(id: number, usuarioId: number) {
  const statement = db.prepareSync(
    'DELETE FROM pecas WHERE id = ? AND usuario_id = ?'
  );

  try {
    statement.executeSync([id, usuarioId]);
  } finally {
    statement.finalizeSync();
  }
}

export function buscarPecaPorId(id: number, usuarioId: number) {
  const peca = db.getFirstSync(
    'SELECT * FROM pecas WHERE id = ? AND usuario_id = ?',
    [id, usuarioId]
  );

  return peca;
}

export function editarPeca(
  id: number,
  usuarioId: number,
  nome: string,
  tipo: string
) {
  const statement = db.prepareSync(
    'UPDATE pecas SET nome = ?, tipo = ? WHERE id = ? AND usuario_id = ?'
  );

  try {
    statement.executeSync([nome, tipo, id, usuarioId]);
  } finally {
    statement.finalizeSync();
  }
}

export function atualizarAnalisePeca(
  id: number,
  usuarioId: number,
  corDetectada: string,
  paleta: string | null,
  imagemResultado: string | null
) {
  const statement = db.prepareSync(
    'UPDATE pecas SET cor_detectada = ?, paleta = ?, imagem_resultado = ? WHERE id = ? AND usuario_id = ?'
  );

  try {
    statement.executeSync([corDetectada, paleta, imagemResultado, id, usuarioId]);
  } finally {
    statement.finalizeSync();
  }
}
