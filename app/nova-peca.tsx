import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { cadastrarPeca } from "@/src/database/database";
import ScreenScroll from "@/src/components/ScreenScroll";
import { analisarImagem } from "@/src/services/api";

export default function NovaPecaScreen() {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [imagemUri, setImagemUri] = useState<string | null>(null);
  const [corDetectada, setCorDetectada] = useState<string | null>(null);
  const [paleta, setPaleta] = useState<string | null>(null);
  const [imagemResultado, setImagemResultado] = useState<string | null>(null);
  const [analisando, setAnalisando] = useState(false);

  async function escolherImagem() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissao.granted) {
      Alert.alert(
        "Permissão necessária",
        "Permita o acesso à galeria para escolher uma imagem.",
      );
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });

    if (!resultado.canceled) {
      setImagemUri(resultado.assets[0].uri);
      setCorDetectada(null);
      setPaleta(null);
      setImagemResultado(null);
    }
  }

  async function handleAnalisarIA() {
    if (!imagemUri) {
      Alert.alert("Atenção", "Selecione uma foto antes de analisar.");
      return;
    }

    try {
      setAnalisando(true);

      const resultado = await analisarImagem(imagemUri);

      let corTexto = "";

      if (typeof resultado.cor_principal === "string") {
        corTexto = resultado.cor_principal;
      } else if (resultado.cor_principal?.nome) {
        corTexto = resultado.cor_principal.nome;
      } else if (resultado.cor_principal?.cor) {
        corTexto = resultado.cor_principal.cor;
      } else if (resultado.cor_principal?.hex) {
        corTexto = resultado.cor_principal.hex;
      } else {
        corTexto = JSON.stringify(resultado.cor_principal);
      }

      setCorDetectada(corTexto);
      setPaleta(JSON.stringify(resultado.cores));
      setImagemResultado(resultado.imagem_resultado);

      Alert.alert("Análise concluída", `Cor principal: ${corTexto}`);
    } catch (error: any) {
      Alert.alert(
        "Erro IA",
        error.message || "Não foi possível analisar a imagem com IA.",
      );
    } finally {
      setAnalisando(false);
    }
  }

  function handleSalvar() {
    if (!nome || !tipo) {
      Alert.alert("Atenção", "Preencha o nome e o tipo da peça.");
      return;
    }

    if (!imagemUri) {
      Alert.alert("Atenção", "Selecione uma foto da peça.");
      return;
    }

    try {
      cadastrarPeca(
        1,
        nome,
        tipo,
        imagemUri,
        corDetectada,
        paleta,
        imagemResultado,
      );

      Alert.alert("Sucesso", "Peça cadastrada com sucesso!");

      router.push("/minhas-pecas");
    } catch {
      Alert.alert("Erro", "Não foi possível cadastrar a peça.");
    }
  }

  return (
    <ScreenScroll>
      <View style={styles.card}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.titulo}>Cadastrar peça</Text>

        <Text style={styles.subtitulo}>
          Informe os dados da peça, selecione uma foto e analise a cor com IA.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Nome da peça"
          placeholderTextColor="#94A3B8"
          value={nome}
          onChangeText={setNome}
        />

        <TextInput
          style={styles.input}
          placeholder="Tipo da peça"
          placeholderTextColor="#94A3B8"
          value={tipo}
          onChangeText={setTipo}
        />

        <TouchableOpacity style={styles.botaoImagem} onPress={escolherImagem}>
          <Text style={styles.textoBotaoImagem}>
            {imagemUri ? "Trocar foto" : "Selecionar foto"}
          </Text>
        </TouchableOpacity>

        {imagemUri && (
          <Image
            source={{ uri: imagemUri }}
            style={styles.preview}
            resizeMode="cover"
          />
        )}

        <TouchableOpacity
          style={styles.botaoIA}
          onPress={handleAnalisarIA}
          disabled={analisando}
        >
          <Text style={styles.textoBotaoIA}>
            {analisando ? "Analisando..." : "Analisar com IA"}
          </Text>
        </TouchableOpacity>

        {corDetectada && (
          <View style={styles.resultadoBox}>
            <Text style={styles.resultadoTitulo}>Resultado da IA</Text>
            <Text style={styles.resultadoTexto}>
              Cor principal: {corDetectada}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.botaoPrincipal} onPress={handleSalvar}>
          <Text style={styles.textoBotaoPrincipal}>Salvar peça</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.voltar}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  logo: {
    width: 150,
    height: 90,
    alignSelf: "center",
    marginBottom: 4,
  },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 18,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    fontSize: 16,
    color: "#1E293B",
  },
  botaoImagem: {
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#4F46E5",
    width: "100%",
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 10,
  },
  textoBotaoImagem: {
    color: "#4F46E5",
    fontSize: 16,
    fontWeight: "bold",
  },
  preview: {
    width: "100%",
    height: 150,
    borderRadius: 16,
    marginBottom: 10,
  },
  botaoIA: {
    backgroundColor: "#0F172A",
    width: "100%",
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 10,
  },
  textoBotaoIA: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  resultadoBox: {
    backgroundColor: "#ECFDF5",
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  resultadoTitulo: {
    color: "#065F46",
    fontWeight: "bold",
    marginBottom: 4,
  },
  resultadoTexto: {
    color: "#047857",
    fontSize: 14,
  },
  botaoPrincipal: {
    backgroundColor: "#4F46E5",
    width: "100%",
    padding: 15,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 4,
  },
  textoBotaoPrincipal: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  voltar: {
    textAlign: "center",
    marginTop: 16,
    color: "#4F46E5",
    fontWeight: "bold",
  },
});
