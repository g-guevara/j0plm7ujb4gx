import * as FileSystem from "expo-file-system";

// Function to send a request to OpenAI with an image
export const callOpenAI = async (base64Image: string, apiKey: string, addLog: (message: string) => void) => {
  addLog("-------- ENVIANDO SOLICITUD A OPENAI --------");
  addLog("URL: https://api.openai.com/v1/chat/completions");
  addLog("Método: POST");
  
  // Preparar los datos para la API de OpenAI con un prompt más simple y directo
  const prompt = "Observa esta captura de pantalla de una aplicación bancaria y extrae todas las transacciones. Para cada transacción, dame fecha, nombre y monto. Devuelve un array JSON con este formato exacto: [{\"date\":\"YYYY-MM-DD\",\"name\":\"Nombre de transacción\",\"mount\":NUMERO}]. El monto debe ser un número sin símbolos. Si es un gasto, el número es positivo. Si es un ingreso, el número es negativo. IMPORTANTE: devuelve SOLO el array JSON sin texto adicional.";
  addLog(`Prompt: ${prompt}`);
  
  // Usar el modelo gpt-4o en lugar de gpt-4-vision-preview que está descontinuado
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
    max_tokens: 1000
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
    addLog(`Respuesta (primeros 100 caracteres): ${responseText.substring(0, 100)}...`);
    
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
export const extractTransactionsFromResponse = (content: string, addLog: (message: string) => void) => {
  let extractedTransactions = [];
  
  // Intento 1: Parsear contenido directamente como JSON
  try {
    addLog("Intento #1: Parsear contenido directamente");
    extractedTransactions = JSON.parse(content);
    addLog("Parseo directo exitoso");
    return extractedTransactions;
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
        return extractedTransactions;
      } catch (error2: any) {
        addLog(`Parseo de coincidencia falló: ${error2.message}`);
        throw error2;
      }
    } else {
      addLog("No se encontró array JSON en la respuesta");
      throw new Error("No se pudo extraer JSON de la respuesta");
    }
  }
};