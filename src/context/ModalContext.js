import { createContext, useContext, useRef, useState, useEffect } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  Animated, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, size, space, radius, shadow } from '../theme';

const ModalContext = createContext(null);
export const useModal = () => useContext(ModalContext);

const EMPTY = {
  visible: false,
  type: 'alert',       // 'alert' | 'confirm' | 'actions'
  title: '',
  message: '',
  variant: 'info',     // 'info' | 'success' | 'error'
  confirmLabel: 'Entendido',
  destructive: false,
  onConfirm: null,
  actions: [],
};

const VARIANTS = {
  info:    { icon: 'information-circle', iconColor: colors.canopy,     iconBg: colors.sageFaint },
  success: { icon: 'checkmark-circle',   iconColor: colors.successText, iconBg: colors.successBg },
  error:   { icon: 'alert-circle',       iconColor: colors.errorText,   iconBg: colors.errorBg  },
};

export function ModalProvider({ children }) {
  const [state, setState] = useState(EMPTY);
  const insets = useSafeAreaInsets();

  const backdropAnim = useRef(new Animated.Value(0)).current;
  const cardAnim     = useRef(new Animated.Value(0.88)).current;
  const slideAnim    = useRef(new Animated.Value(500)).current;

  const isActions = state.type === 'actions';

  useEffect(() => {
    if (!state.visible) return;
    if (isActions) {
      Animated.parallel([
        Animated.timing(backdropAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(slideAnim,    { toValue: 0, damping: 22, stiffness: 260, mass: 0.8, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(cardAnim,     { toValue: 1, damping: 18, stiffness: 220, mass: 0.7, useNativeDriver: true }),
      ]).start();
    }
  }, [state.visible, isActions]);

  function dismiss() {
    const done = () => setState(EMPTY);
    if (isActions) {
      Animated.parallel([
        Animated.timing(backdropAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
        Animated.timing(slideAnim,    { toValue: 500, duration: 200, useNativeDriver: true }),
      ]).start(done);
    } else {
      Animated.parallel([
        Animated.timing(backdropAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.spring(cardAnim,     { toValue: 0.88, damping: 20, stiffness: 300, useNativeDriver: true }),
      ]).start(done);
    }
  }

  function showAlert(title, message, variant = 'info') {
    backdropAnim.setValue(0);
    cardAnim.setValue(0.88);
    setState({ ...EMPTY, visible: true, type: 'alert', title, message, variant, confirmLabel: 'Entendido' });
  }

  function showConfirm({ title, message = '', confirmLabel = 'Confirmar', destructive = false, onConfirm }) {
    backdropAnim.setValue(0);
    cardAnim.setValue(0.88);
    setState({ ...EMPTY, visible: true, type: 'confirm', title, message, confirmLabel, destructive, onConfirm: onConfirm ?? null });
  }

  function showActions(title, actions) {
    backdropAnim.setValue(0);
    slideAnim.setValue(500);
    setState({ ...EMPTY, visible: true, type: 'actions', title, actions });
  }

  function handleConfirm() {
    const cb = state.onConfirm;
    dismiss();
    if (cb) setTimeout(cb, 230);
  }

  function handleAction(action) {
    const cb = action.onPress;
    dismiss();
    if (cb && !action.cancel) setTimeout(cb, 230);
  }

  const v = VARIANTS[state.variant] ?? VARIANTS.info;

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm, showActions }}>
      {children}

      <Modal
        visible={state.visible}
        transparent
        statusBarTranslucent
        animationType="none"
        onRequestClose={dismiss}
      >
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: backdropAnim }]} />

        {isActions ? (
          <View style={styles.actionsOuter}>
            <Pressable style={{ flex: 1 }} onPress={dismiss} />
            <Animated.View
              style={[
                styles.actionsSheet,
                { paddingBottom: Math.max(insets.bottom + 8, 24), transform: [{ translateY: slideAnim }] },
              ]}
            >
              <View style={styles.sheetHandle} />
              {state.title ? (
                <Text style={styles.actionsTitle}>{state.title}</Text>
              ) : null}
              {state.actions.map((action, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.actionRow,
                    i > 0 && styles.actionRowBorder,
                    action.cancel && styles.actionRowCancel,
                  ]}
                  onPress={() => handleAction(action)}
                  activeOpacity={0.6}
                >
                  {action.icon ? (
                    <Ionicons
                      name={action.icon}
                      size={20}
                      color={action.destructive ? colors.errorText : colors.stone600}
                      style={styles.actionIcon}
                    />
                  ) : null}
                  <Text style={[
                    styles.actionText,
                    action.destructive && styles.actionTextDestructive,
                    action.cancel      && styles.actionTextCancel,
                  ]}>
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          </View>
        ) : (
          <View style={styles.dialogOuter} pointerEvents="box-none">
            {state.type === 'alert' && (
              <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} />
            )}
            <Animated.View
              style={[styles.dialogCard, { transform: [{ scale: cardAnim }] }]}
            >
              <View style={[styles.iconCircle, { backgroundColor: v.iconBg }]}>
                <Ionicons name={v.icon} size={30} color={v.iconColor} />
              </View>

              <Text style={styles.dialogTitle}>{state.title}</Text>

              {state.message ? (
                <Text style={styles.dialogMsg}>{state.message}</Text>
              ) : (
                <View style={{ height: space.lg }} />
              )}

              {state.type === 'confirm' ? (
                <View style={styles.confirmRow}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={dismiss} activeOpacity={0.7}>
                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.confirmBtn, state.destructive && styles.confirmBtnRed]}
                    onPress={handleConfirm}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.confirmBtnText}>{state.confirmLabel}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.okBtn} onPress={dismiss} activeOpacity={0.85}>
                  <Text style={styles.okBtnText}>{state.confirmLabel}</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          </View>
        )}
      </Modal>
    </ModalContext.Provider>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: colors.overlayDark },

  /* ── Dialog ── */
  dialogOuter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: space.xl,
  },
  dialogCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingHorizontal: space.xl,
    paddingTop: space.xl,
    paddingBottom: space.lg,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    ...shadow.lg,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.lg,
  },
  dialogTitle: {
    fontFamily: font.bold,
    fontSize: size.md,
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: -0.2,
    marginBottom: space.sm,
  },
  dialogMsg: {
    fontFamily: font.regular,
    fontSize: size.base,
    color: colors.stone600,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: space.xl,
  },
  okBtn: {
    backgroundColor: colors.forest,
    borderRadius: radius.md,
    paddingVertical: space.md,
    alignSelf: 'stretch',
    alignItems: 'center',
    ...shadow.sm,
  },
  okBtnText: {
    fontFamily: font.bold,
    fontSize: size.base,
    color: colors.white,
  },
  confirmRow: {
    flexDirection: 'row',
    gap: space.sm,
    alignSelf: 'stretch',
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.stone200,
    borderRadius: radius.md,
    paddingVertical: space.md,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: font.semibold,
    fontSize: size.base,
    color: colors.stone600,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: colors.forest,
    borderRadius: radius.md,
    paddingVertical: space.md,
    alignItems: 'center',
    ...shadow.sm,
  },
  confirmBtnRed: { backgroundColor: colors.errorText },
  confirmBtnText: {
    fontFamily: font.bold,
    fontSize: size.base,
    color: colors.white,
  },

  /* ── Action sheet ── */
  actionsOuter: { flex: 1 },
  actionsSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: space.xl,
    paddingTop: space.sm,
    ...shadow.lg,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.stone200,
    borderRadius: radius.pill,
    alignSelf: 'center',
    marginBottom: space.lg,
  },
  actionsTitle: {
    fontFamily: font.semibold,
    fontSize: size.xs,
    color: colors.stone400,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: space.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  actionRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.stone100,
  },
  actionRowCancel: {
    borderTopWidth: 1,
    borderTopColor: colors.stone100,
    marginTop: space.sm,
  },
  actionIcon: { marginRight: space.md },
  actionText: {
    fontFamily: font.medium,
    fontSize: size.base,
    color: colors.ink,
  },
  actionTextDestructive: { color: colors.errorText, fontFamily: font.semibold },
  actionTextCancel:      { color: colors.stone400,  fontFamily: font.regular  },
});
