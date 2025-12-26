import { useCallback, useEffect, useRef, useState } from 'react'
import { OnboardingData, OnboardingStep } from '../../types/onboarding.types'

const STORAGE_KEY_DATA = 'onboarding_draft'
const STORAGE_KEY_STEP = 'onboarding_step'

interface UseOnboardingPersistenceReturn {
  hasDraft: boolean
  draftStep: OnboardingStep | null
  draftData: OnboardingData | null
  clearDraft: () => void
  saveDraft: (step: OnboardingStep, data: OnboardingData) => void
}

export function useOnboardingPersistence(
  step: OnboardingStep,
  onboardingData: OnboardingData,
  onRestore?: (step: OnboardingStep, data: OnboardingData) => void
): UseOnboardingPersistenceReturn {
  const [hasDraft, setHasDraft] = useState(false)
  const [draftStep, setDraftStep] = useState<OnboardingStep | null>(null)
  const [draftData, setDraftData] = useState<OnboardingData | null>(null)
  const isInitialMount = useRef(true)
  const lastSavedStep = useRef<OnboardingStep | null>(null)

  const saveDraft = useCallback((currentStep: OnboardingStep, currentData: OnboardingData) => {
    try {
      // Garantir que arrays existam
      const dataToSave: OnboardingData = {
        ...currentData,
        lesoes: Array.isArray(currentData.lesoes) ? currentData.lesoes : [],
        preferencias: Array.isArray(currentData.preferencias) ? currentData.preferencias : [],
        problemasAnteriores: Array.isArray(currentData.problemasAnteriores) ? currentData.problemasAnteriores : [],
        objetivosAdicionais: Array.isArray(currentData.objetivosAdicionais) ? currentData.objetivosAdicionais : [],
      }
      
      localStorage.setItem(STORAGE_KEY_STEP, currentStep.toString())
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(dataToSave))
    } catch (error) {
      console.error('[useOnboardingPersistence] Erro ao salvar draft:', error)
    }
  }, [])

  // Carregar draft no mount inicial
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      
      try {
        const savedStep = localStorage.getItem(STORAGE_KEY_STEP)
        const savedData = localStorage.getItem(STORAGE_KEY_DATA)
        
        if (savedStep && savedData) {
          const parsedStep = Number(savedStep) as OnboardingStep
          const parsedData = JSON.parse(savedData) as OnboardingData
          
          if (parsedStep > 0 && parsedData) {
            setHasDraft(true)
            setDraftStep(parsedStep)
            setDraftData(parsedData)
          }
        }
      } catch (error) {
        console.error('[useOnboardingPersistence] Erro ao carregar draft:', error)
      }
    }
  }, [])

  // Salvar automaticamente quando step ou dados mudarem (mas não no mount inicial)
  useEffect(() => {
    if (isInitialMount.current) return
    if (step === 0) return // Não salvar quando estiver na landing
    
    // Salvar sempre que step ou dados mudarem
    saveDraft(step, onboardingData)
    lastSavedStep.current = step
  }, [step, onboardingData, saveDraft])

  const clearDraft = () => {
    try {
      localStorage.removeItem(STORAGE_KEY_STEP)
      localStorage.removeItem(STORAGE_KEY_DATA)
      setHasDraft(false)
      setDraftStep(null)
      setDraftData(null)
    } catch (error) {
      console.error('[useOnboardingPersistence] Erro ao limpar draft:', error)
    }
  }

  // Expor função para restaurar (chamada externamente via callback)
  useEffect(() => {
    if (onRestore && hasDraft && draftStep !== null && draftData !== null) {
      // Não restaurar automaticamente - deixar componente decidir quando mostrar modal
      // onRestore(draftStep, draftData)
    }
  }, [hasDraft, draftStep, draftData, onRestore])

  return {
    hasDraft,
    draftStep,
    draftData,
    clearDraft,
    saveDraft
  }
}

