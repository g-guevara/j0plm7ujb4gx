import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { FlatList, Image, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Card } from "../data/sampleData";
import { styles } from "../styles/4o-scanStyles";
import { PartialTransaction } from "../utils/imageUtils";

// Header Component - Simplified since header is now handled in main screen
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

// API Key Modal Component - Updated for new design
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
    <View style={styles.sectionHeader}>
      <Ionicons name="key-outline" size={24} color="#333" />
      <Text style={styles.apiKeyTitle}>OpenAI API Key Required</Text>
    </View>
    <Text style={styles.apiKeyDescription}>
      Enter your OpenAI API Key to analyze images. The API key will be stored securely on your device.
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
      <TouchableOpacity
        style={[styles.scanButton, { backgroundColor: '#95a5a6', marginRight: 8 }]}
        onPress={onCancel}
      >
        <Text style={styles.scanButtonText}>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.scanButton, { marginLeft: 8 }]}
        onPress={onSave}
      >
        <Text style={styles.scanButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// Add Image Button Component - Circular design
const AddImageButton = ({ 
  onPress, 
  disabled 
}: { 
  onPress: () => void;
  disabled: boolean;
}) => (
  <TouchableOpacity 
    style={[styles.addImageCircle, disabled && styles.addImageCircleDisabled]}
    onPress={onPress}
    disabled={disabled}
  >
    <Ionicons 
      name="add" 
      size={32} 
      color={disabled ? "#ccc" : "#3498db"} 
    />
  </TouchableOpacity>
);

// Image Item Component - Enhanced with remove button
const ImageItem = ({ 
  uri, 
  index, 
  onRemove 
}: { 
  uri: string;
  index: number;
  onRemove: (index: number) => void;
}) => (
  <View style={styles.imageGridItem}>
    <Image source={{ uri }} style={styles.gridImage} resizeMode="cover" />
    <TouchableOpacity 
      style={styles.removeImageButtonGrid}
      onPress={() => onRemove(index)}
    >
      <Ionicons name="close-circle" size={20} color="#e74c3c" />
    </TouchableOpacity>
  </View>
);

// Images Section Component - Single card design (no wrapper)
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
}) => {
  const maxImages = 7;
  const canAddMore = images.length < maxImages && !scanning;

  // Create a grid data array that includes the add button and images
  const gridData = [];
  
  // Add the "+" button if we can add more images
  if (canAddMore) {
    gridData.push({ type: 'add-button' });
  }
  
  // Add all the images
  images.forEach((uri, index) => {
    gridData.push({ type: 'image', uri, index });
  });

  const renderGridItem = ({ item }: any) => {
    if (item.type === 'add-button') {
      return (
        <AddImageButton 
          onPress={onAddImages}
          disabled={scanning}
        />
      );
    } else {
      return (
        <ImageItem 
          uri={item.uri}
          index={item.index}
          onRemove={removeImage}
        />
      );
    }
  };

  return (
    <View style={styles.imageGridContainer}>
      <View style={styles.imageGridHeader}>
        <View style={styles.sectionHeader}>
          <Ionicons name="images-outline" size={20} color="#333" />
          <Text style={styles.imageGridTitle}>Select Images</Text>
        </View>
        <Text style={styles.imageCounter}>
          {images.length}/{maxImages}
        </Text>
      </View>
      
      <Text style={styles.imageGridSubtitle}>
        Tap + to add receipt images (max. {maxImages})
      </Text>

      {/* Grid of images and add button */}
      <FlatList
        data={gridData}
        renderItem={renderGridItem}
        numColumns={3}
        keyExtractor={(item, index) => `grid-${index}`}
        contentContainerStyle={styles.imageGrid}
        scrollEnabled={false}
      />

      {/* Empty state when no images */}
      {images.length === 0 && !canAddMore && (
        <View style={styles.emptyImageState}>
          <Ionicons name="camera-outline" size={48} color="#ccc" />
          <Text style={styles.emptyImageText}>No images selected</Text>
        </View>
      )}
    </View>
  );
};

// Transaction Item Component - Enhanced design
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
    activeOpacity={0.7}
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
            <Ionicons name="checkmark" size={16} color="white" />
          )}
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

// Transaction Results Component - Enhanced design
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
}) => {
  const selectedCount = transactions.filter(t => t.selected).length;
  
  return (
    <View style={{ marginTop: 16 }}>
      <View style={styles.resultHeader}>
        <Text style={styles.resultTitle}>
          Found {transactions.length} Transaction{transactions.length !== 1 ? 's' : ''}
        </Text>
        
        <View style={styles.selectAllContainer}>
          <Text style={styles.selectAllText}>Select All</Text>
          <Switch
            value={transactions.every(t => t.selected)}
            onValueChange={onToggleAll}
            trackColor={{ false: "#e9ecef", true: "#a0c4ff" }}
            thumbColor={transactions.every(t => t.selected) ? "#3498db" : "#f4f3f4"}
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

      <View style={{ marginTop: 20 }}>
        <TouchableOpacity
          style={[
            styles.scanButton,
            !selectedCount && styles.scanButtonDisabled
          ]}
          onPress={onSaveTransactions}
          disabled={!selectedCount}
        >
          <Ionicons name="save-outline" size={20} color="white" style={styles.scanButtonIcon} />
          <Text style={styles.scanButtonText}>
            Save {selectedCount} Transaction{selectedCount !== 1 ? 's' : ''}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Export all components as a single object
export const ScanScreenComponents = {
  Header,
  ApiKeyModal,
  ImageSection,
  TransactionResults
};