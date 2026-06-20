import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('colorassist.db');

export type Usuario = {
  id: number;
  nome: string;
  email: string;
};

export function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL
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
}

export function cadastrarUsuario(nome: string, email: string, senha: string) {
  const statement = db.prepareSync(
    'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)'
  );

  try {
    statement.executeSync([nome, email, senha]);
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
    'SELECT id, nome, email FROM usuarios WHERE email = ? AND senha = ?',
    [email, senha]
  );

  return usuario;
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
