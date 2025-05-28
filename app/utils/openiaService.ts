import * as FileSystem from "expo-file-system";
import { Category } from "../data/sampleData";

// Function to send a request to OpenAI with an image and available categories
export const callOpenAI = async (
  base64Image: string, 
  apiKey: string, 
  addLog: (message: string) => void,
  availableCategories: Category[] = []
) => {
  addLog("-------- ENVIANDO SOLICITUD A OPENAI --------");
  addLog("URL: https://api.openai.com/v1/chat/completions");
  addLog("Método: POST");
  
  // Crear lista de categorías disponibles para el prompt
  const categoryList = availableCategories.map(cat => cat.name).join(", ");
  addLog(`Categorías disponibles: ${categoryList}`);
  
  // Prompt mejorado que incluye las categorías disponibles
  const prompt = `Observa esta foto y extrae todas las transacciones. Para cada transacción, dame fecha, nombre, monto y categoría.

CATEGORÍAS DISPONIBLES: ${categoryList}

Para cada transacción:
1. Analiza el nombre/descripción de la transacción
2. Asigna la categoría más apropiada de la lista disponible
3. Si no encuentras una categoría que coincida significativamente, usa "Others"

Ejemplos de asignación:
- "Uber", "Taxi", "Metro" → Transportation
- "Supermercado", "Grocery" → Food
- "Netflix", "Spotify" → Life and Entertainment
- "Farmacia", "Doctor" → Health
- "Renta", "Arriendo" → Housing
- Si no hay coincidencia clara → Others

Devuelve un array JSON con este formato exacto:
[{"date":"YYYY-MM-DD","name":"Nombre de transacción","mount":NUMERO,"category":"CATEGORIA"}]

REGLAS:
- El monto debe ser un número sin símbolos
- Si es un gasto, el número es positivo
- Si es un ingreso, el número es negativo
- La categoría debe ser exactamente una de la lista disponible o "Others"
- IMPORTANTE: devuelve SOLO el array JSON sin texto adicional`;

  addLog(`Prompt: ${prompt.substring(0, 200)}...`);
  
  // Usar el modelo gpt-4o
  const payload = {
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: `data:image/png;base64,${base64Image}` } }
        ]
      }
    ],
    max_tokens: 1500
  };
  
  addLog(`Modelo utilizado: ${payload.model}`);

  try {
    addLog("Enviando solicitud a OpenAI...");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });
    
    addLog(`Respuesta recibida. Status: ${response.status}`);
    const responseText = await response.text();
    addLog(`Respuesta (primeros 500 caracteres): ${responseText.substring(0, 500)}...`);
    
    return { responseText, status: response.status, ok: response.ok };
  } catch (error: any) {
    addLog(`ERROR en fetch: ${error.message}`);
    throw error;
  }
};

// Función para preparar una imagen como base64
export const prepareImageBase64 = async (imageUri: string, addLog: (message: string) => void) => {
  addLog("Leyendo imagen como base64...");
  try {
    const base64Image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    addLog(`Imagen convertida a base64. Longitud: ${base64Image.length}`);
    return base64Image;
  } catch (error: any) {
    addLog(`ERROR en conversión a base64: ${error.message}`);
    throw error;
  }
};

// Extraer transacciones de la respuesta de OpenAI
export const extractTransactionsFromResponse = (
  content: string, 
  addLog: (message: string) => void,
  availableCategories: Category[] = []
) => {
  let extractedTransactions = [];
  
  // Intento 1: Parsear contenido directamente como JSON
  try {
    addLog("Intento #1: Parsear contenido directamente");
    extractedTransactions = JSON.parse(content);
    addLog("Parseo directo exitoso");
  } catch (error: any) {
    addLog(`Parseo directo falló: ${error.message}`);
    
    // Intento 2: Buscar array JSON con regex
    addLog("Intento #2: Buscar array JSON con regex");
    const arrayMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
    
    if (arrayMatch) {
      addLog(`Coincidencia encontrada: ${arrayMatch[0].substring(0, 50)}...`);
      try {
        extractedTransactions = JSON.parse(arrayMatch[0]);
        addLog("Parseo de coincidencia exitoso");
      } catch (error2: any) {
        addLog(`Parseo de coincidencia falló: ${error2.message}`);
        throw error2;
      }
    } else {
      addLog("No se encontró array JSON en la respuesta");
      throw new Error("No se pudo extraer JSON de la respuesta");
    }
  }

  // Validar y limpiar categorías
  const categoryNames = availableCategories.map(cat => cat.name);
  categoryNames.push("Others"); // Asegurar que "Others" esté disponible
  
  extractedTransactions = extractedTransactions.map((transaction: any, index: number) => {
    addLog(`Validando transacción #${index + 1}: ${transaction.name || 'Sin nombre'}`);
    
    // Validar categoría
    if (!transaction.category || !categoryNames.includes(transaction.category)) {
      addLog(`Categoría "${transaction.category}" no válida, asignando "Others"`);
      transaction.category = "Others";
    } else {
      addLog(`Categoría "${transaction.category}" válida`);
    }
    
    return transaction;
  });
  
  return extractedTransactions;
};