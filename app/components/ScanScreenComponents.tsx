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

// Image Thumbnail Component - Enhanced
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

// Images Section Component - Updated design
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
            <Ionicons name="images" size={48} color="#3498db" />
            <Text style={styles.imageCountText}>
              {images.length} {images.length === 1 ? "image selected" : "images selected"}
            </Text>
            <Text style={styles.imageTapText}>
              Tap to add more images
            </Text>
          </View>
        ) : (
          <View style={styles.imageCountContainer}>
            <Ionicons name="camera-outline" size={48} color="#6c757d" />
            <Text style={styles.imagePickerText}>
              Tap to select images (max. 7)
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>

    {/* Horizontal thumbnails list */}
    {images.length > 0 && (
      <View style={styles.thumbnailContainer}>
        <Text style={styles.thumbnailTitle}>
          Selected Images ({images.length}/7)
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
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailList}
        />
        {images.length < 7 && !scanning && (
          <TouchableOpacity 
            style={styles.addImageButton}
            onPress={onAddImages}
          >
            <Ionicons name="add-circle" size={20} color="#3498db" />
            <Text style={styles.addImageText}>Add More Images</Text>
          </TouchableOpacity>
        )}
      </View>
    )}
  </View>
);

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