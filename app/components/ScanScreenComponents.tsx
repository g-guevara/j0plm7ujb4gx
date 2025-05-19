import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Button, FlatList, Image, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Card } from "../data/sampleData";
import { styles } from "../styles/4o-scanStyles";
import { PartialTransaction } from "../utils/imageUtils";

// Header Component
const Header = ({ 
  title, 
  subtitle, 
  selectedCard 
}: { 
  title: string;
  subtitle: string;
  selectedCard?: Card;
}) => (
  <View style={styles.header}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>{subtitle}</Text>
    {selectedCard && (
      <View style={[styles.cardIndicator, { backgroundColor: selectedCard.color }]}>
        <Text style={styles.cardName}>{selectedCard.name}</Text>
      </View>
    )}
  </View>
);

// API Key Modal Component
const ApiKeyModal = ({ 
  apiKey, 
  setApiKey, 
  onCancel, 
  onSave 
}: { 
  apiKey: string;
  setApiKey: (key: string) => void;
  onCancel: () => void;
  onSave: () => void;
}) => (
  <View style={styles.apiKeyContainer}>
    <Text style={styles.apiKeyTitle}>API Key de OpenAI</Text>
    <Text style={styles.apiKeyDescription}>
      Ingresa tu API Key de OpenAI para analizar imágenes.
      La API key se guardará de forma segura en tu dispositivo.
    </Text>
    <TextInput
      style={styles.apiKeyInput}
      placeholder="sk-..."
      value={apiKey}
      onChangeText={setApiKey}
      secureTextEntry={true}
      autoCapitalize="none"
    />
    <View style={styles.apiKeyButtons}>
      <Button
        title="Cancelar"
        onPress={onCancel}
        color="#999"
      />
      <Button
        title="Guardar"
        onPress={onSave}
      />
    </View>
  </View>
);

// Image Thumbnail Component
const ImageThumbnail = ({ 
  uri, 
  index, 
  onRemove 
}: { 
  uri: string;
  index: number;
  onRemove: (index: number) => void;
}) => (
  <View style={styles.imageItemContainer}>
    <View style={styles.imageItem}>
      <Image source={{ uri }} style={styles.thumbnailImage} resizeMode="cover" />
    </View>
    <TouchableOpacity 
      style={styles.removeImageButton}
      onPress={() => onRemove(index)}
    >
      <Ionicons name="close-circle" size={22} color="#e74c3c" />
    </TouchableOpacity>
  </View>
);

// Images Section Component
const ImageSection = ({
  images,
  scanning,
  removeImage,
  onAddImages
}: {
  images: string[];
  scanning: boolean;
  removeImage: (index: number) => void;
  onAddImages: () => void;
}) => (
  <View style={styles.imageSection}>
    <View style={styles.imageContainer}>
      <TouchableOpacity 
        style={styles.imagePicker} 
        onPress={onAddImages}
        disabled={scanning}
      >
        {images.length > 0 ? (
          <View style={styles.imageCountContainer}>
            <Ionicons name="images" size={40} color="#3498db" />
            <Text style={styles.imageCountText}>
              {images.length} {images.length === 1 ? "imagen seleccionada" : "imágenes seleccionadas"}
            </Text>
            <Text style={styles.imageTapText}>
              Toca para añadir más imágenes
            </Text>
          </View>
        ) : (
          <Text style={styles.imagePickerText}>
            Toca para seleccionar imágenes (máx. 7)
          </Text>
        )}
      </TouchableOpacity>
    </View>

    {/* Horizontal thumbnails list */}
    {images.length > 0 && (
      <View style={styles.thumbnailContainer}>
        <Text style={styles.thumbnailTitle}>
          Imágenes seleccionadas ({images.length}/7)
        </Text>
        <FlatList
          data={images}
          renderItem={({ item, index }) => (
            <ImageThumbnail 
              uri={item} 
              index={index} 
              onRemove={removeImage} 
            />
          )}
          keyExtractor={(_, index) => `img-${index}`}
          horizontal
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={styles.thumbnailList}
        />
        {images.length < 7 && !scanning && (
          <TouchableOpacity 
            style={styles.addImageButton}
            onPress={onAddImages}
          >
            <Ionicons name="add-circle" size={24} color="#3498db" />
            <Text style={styles.addImageText}>Añadir imagen</Text>
          </TouchableOpacity>
        )}
      </View>
    )}
  </View>
);

// Transaction Item Component
const TransactionItem = ({
  transaction,
  index,
  selectedCard,
  onToggle,
  formatAmount,
  getAmountStyle,
  styles
}: {
  transaction: PartialTransaction;
  index: number;
  selectedCard?: Card;
  onToggle: (index: number) => void;
  formatAmount: (amount: number | undefined) => string;
  getAmountStyle: (amount: number | undefined, styles: any) => any;
  styles: any;
}) => (
  <TouchableOpacity 
    style={[
      styles.transactionCard,
      transaction.selected ? styles.selectedCard : {}
    ]}
    onPress={() => onToggle(index)}
  >
    <View style={styles.transactionInfo}>
      <Text style={styles.transactionName}>{transaction.name}</Text>
      <Text style={styles.transactionDate}>{transaction.date}</Text>
      {transaction.category && (
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{transaction.category}</Text>
        </View>
      )}
      {selectedCard && (
        <Text style={styles.cardNameText}>
          <Ionicons name="card-outline" size={12} color="#666" /> {selectedCard.name}
        </Text>
      )}
    </View>
    <View style={styles.transactionAmount}>
      <Text style={getAmountStyle(transaction.mount, styles)}>
        {formatAmount(transaction.mount)}
      </Text>
      <View style={styles.checkboxContainer}>
        <View style={[
          styles.checkbox,
          transaction.selected ? styles.checkboxSelected : {}
        ]}>
          {transaction.selected && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

// Transaction Results Component
const TransactionResults = ({
  transactions,
  selectedCard,
  onToggleAll,
  onToggleTransaction,
  onSaveTransactions,
  formatAmount,
  getAmountStyle,
  styles
}: {
  transactions: PartialTransaction[];
  selectedCard?: Card;
  onToggleAll: (value: boolean) => void;
  onToggleTransaction: (index: number) => void;
  onSaveTransactions: () => void;
  formatAmount: (amount: number | undefined) => string;
  getAmountStyle: (amount: number | undefined, styles: any) => any;
  styles: any;
}) => (
  <View style={styles.resultContainer}>
    <View style={styles.resultHeader}>
      <Text style={styles.resultTitle}>Transacciones Extraídas ({transactions.length}):</Text>
      
      <View style={styles.selectAllContainer}>
        <Text style={styles.selectAllText}>Seleccionar Todo</Text>
        <Switch
          value={transactions.every(t => t.selected)}
          onValueChange={onToggleAll}
        />
      </View>
    </View>
    
    {transactions.map((transaction, index) => (
      <TransactionItem
        key={index}
        transaction={transaction}
        index={index}
        selectedCard={selectedCard}
        onToggle={onToggleTransaction}
        formatAmount={formatAmount}
        getAmountStyle={getAmountStyle}
        styles={styles}
      />
    ))}

    <View style={styles.buttonContainer}>
      <Button
        title="Guardar Transacciones"
        onPress={onSaveTransactions}
        disabled={!transactions.some(t => t.selected)}
      />
    </View>
  </View>
);

// Export all components as a single object
export const ScanScreenComponents = {
  Header,
  ApiKeyModal,
  ImageSection,
  TransactionResults
};