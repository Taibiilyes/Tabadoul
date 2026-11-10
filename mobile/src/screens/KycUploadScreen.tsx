import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { api } from '../api/client';

/**
 * ملاحظة مهمة للتنفيذ الفعلي: في الإنتاج، لا يجب رفع الصورة عبر body
 * الخادم مباشرة بصيغة base64 كما هو مبسّط هنا للتوضيح، بل يجب:
 * 1. طلب رابط رفع موقّع (pre-signed URL) من الخادم
 * 2. رفع الصورة مباشرة من الهاتف إلى التخزين السحابي المشفّر عبر ذلك الرابط
 * 3. إرسال storageKey فقط إلى /documents/upload
 * هذا يقلل حمل الخادم ويمنع مرور بيانات حساسة عبر أكثر من طبقة.
 */
export default function KycUploadScreen({ navigation }: any) {
  const [idImage, setIdImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function pickIdImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) setIdImage(result.assets[0].uri);
  }

  async function openCameraForSelfie() {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert('يجب السماح بالوصول للكاميرا للتوثيق الحيوي');
        return;
      }
    }
    setShowCamera(true);
  }

  async function submitDocuments() {
    if (!idImage || !selfieImage) {
      Alert.alert('يرجى رفع صورة الهوية والتقاط الصورة الحية أولاً');
      return;
    }
    setUploading(true);
    try {
      // في تطبيق حقيقي: ارفع كل صورة عبر signed URL منفصل ثم أرسل storageKey فقط
      await api.post('/documents/upload', {
        type: 'national_id',
        storageKey: `pending-upload-${Date.now()}-id`,
      });
      await api.post('/documents/upload', {
        type: 'live_selfie',
        storageKey: `pending-upload-${Date.now()}-selfie`,
      });
      Alert.alert(
        'تم الإرسال',
        'تم إرسال وثائقك بنجاح، بانتظار مراجعة الإدارة',
      );
      navigation.replace('Rooms');
    } catch (e: any) {
      Alert.alert('خطأ', e.response?.data?.message || 'فشل رفع الوثائق');
    } finally {
      setUploading(false);
    }
  }

  if (showCamera) {
    return (
      <View style={{ flex: 1 }}>
        <CameraView style={{ flex: 1 }} facing="front">
          <View style={styles.cameraOverlay}>
            <TouchableOpacity
              style={styles.captureBtn}
              onPress={() => {
                // في التنفيذ الفعلي: استخدم cameraRef.current.takePictureAsync()
                setSelfieImage('captured-selfie-placeholder');
                setShowCamera(false);
              }}
            >
              <Text style={styles.captureBtnText}>التقاط</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>توثيق الحساب</Text>
      <Text style={styles.subtitle}>
        هذه الخطوة إجبارية لإجراء المكالمات وإنشاء الغرف. المراجعة تتم يدويًا
        من طرف إدارة التطبيق فقط.
      </Text>

      <Text style={styles.label}>1. بطاقة التعريف الوطنية أو جواز السفر</Text>
      <TouchableOpacity style={styles.uploadBox} onPress={pickIdImage}>
        {idImage ? (
          <Image source={{ uri: idImage }} style={styles.previewImage} />
        ) : (
          <Text style={styles.uploadText}>اضغط لاختيار صورة الوثيقة</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>2. صورة حية (توثيق حيوي)</Text>
      <TouchableOpacity style={styles.uploadBox} onPress={openCameraForSelfie}>
        <Text style={styles.uploadText}>
          {selfieImage ? '✓ تم التقاط الصورة الحية' : 'اضغط لفتح الكاميرا'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={submitDocuments}
        disabled={uploading}
      >
        <Text style={styles.primaryBtnText}>
          {uploading ? 'جارٍ الإرسال...' : 'إرسال للمراجعة'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 60, backgroundColor: '#0B1D3A', flexGrow: 1 },
  title: { fontSize: 24, fontWeight: '700', color: '#FFD700', marginBottom: 8, textAlign: 'center' },
  subtitle: { color: '#9FB3D9', textAlign: 'center', marginBottom: 28, lineHeight: 20 },
  label: { color: '#fff', marginBottom: 8, fontSize: 15, textAlign: 'right' },
  uploadBox: {
    backgroundColor: '#132A52',
    borderRadius: 14,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#22407A',
    borderStyle: 'dashed',
  },
  uploadText: { color: '#9FB3D9' },
  previewImage: { width: '100%', height: '100%', borderRadius: 14 },
  primaryBtn: { backgroundColor: '#FFD700', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 10 },
  primaryBtnText: { color: '#0B1D3A', fontWeight: '700', fontSize: 16 },
  cameraOverlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 40 },
  captureBtn: { backgroundColor: '#FFD700', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 30 },
  captureBtnText: { color: '#0B1D3A', fontWeight: '700' },
});
