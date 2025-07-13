/* ===================================
   PERU LOGISTICS - SISTEMA DE FORMULARIOS
   Validación, envío y mejoras UX para formularios
   =================================== */

'use strict';

const FormSystem = (() => {
  // Estado del sistema
  let state = {
    forms: new Map(),
    validators: new Map(),
    submitHandlers: new Map()
  };

  // Configuración
  const config = {
    validationDelay: 300,
    submitTimeout: 30000,
    showErrorsOnBlur: true,
    showErrorsOnInput: false,
    autoSave: false,
    autoSaveDelay: 2000
  };

  // Mensajes de error personalizados
  const errorMessages = {
    required: 'Este campo es obligatorio',
    email: 'Por favor ingresa un email válido',
    phone: 'Por favor ingresa un teléfono válido',
    dni: 'Por favor ingresa un DNI válido (8 dígitos)',
    ruc: 'Por favor ingresa un RUC válido',
    minLength: 'Debe tener al menos {min} caracteres',
    maxLength: 'No puede tener más de {max} caracteres',
    pattern: 'El formato no es válido',
    number: 'Debe ser un número válido',
    min: 'El valor mínimo es {min}',
    max: 'El valor máximo es {max}',
    terms: 'Debes aceptar los términos y condiciones'
  };

  /* ===================================
     INICIALIZACIÓN
     =================================== */

  const init = () => {
    setupForms();
    setupCustomValidators();
    bindGlobalEvents();
    console.log('✅ Sistema de formularios inicializado');
  };

  const setupForms = () => {
    const forms = window.PeruLogistics.Utils.$$('form');
    
    forms.forEach(form => {
      initializeForm(form);
    });
  };

  const initializeForm = (form) => {
    const formId = form.id || generateFormId();
    form.id = formId;

    // Configurar estado del formulario
    const formState = {
      element: form,
      fields: new Map(),
      isValid: false,
      isSubmitting: false,
      errors: new Map(),
      touched: new Set(),
      autoSaveTimer: null
    };

    state.forms.set(formId, formState);

    // Configurar campos
    setupFormFields(form, formState);
    
    // Configurar eventos
    bindFormEvents(form, formState);
    
    // Configurar submit handler personalizado
    setupSubmitHandler(form, formState);

    console.log(`📝 Formulario inicializado: ${formId}`);
  };

  const generateFormId = () => {
    return 'form_' + Math.random().toString(36).substr(2, 9);
  };

  /* ===================================
     CONFIGURACIÓN DE CAMPOS
     =================================== */

  const setupFormFields = (form, formState) => {
    const fields = form.querySelectorAll('input, select, textarea');
    
    fields.forEach(field => {
      const fieldConfig = {
        element: field,
        name: field.name || field.id,
        type: field.type,
        rules: parseValidationRules(field),
        errorElement: getOrCreateErrorElement(field),
        isValid: true,
        value: field.value,
        originalValue: field.value
      };

      formState.fields.set(field.name || field.id, fieldConfig);
      
      // Configurar eventos del campo
      bindFieldEvents(field, fieldConfig, formState);
    });
  };

  const parseValidationRules = (field) => {
    const rules = [];

    // Required
    if (field.hasAttribute('required')) {
      rules.push({ type: 'required' });
    }

    // Email
    if (field.type === 'email') {
      rules.push({ type: 'email' });
    }

    // Tel (teléfono peruano)
    if (field.type === 'tel' || field.classList.contains('phone-input')) {
      rules.push({ type: 'phone' });
    }

    // DNI
    if (field.classList.contains('dni-input')) {
      rules.push({ type: 'dni' });
    }

    // RUC
    if (field.classList.contains('ruc-input')) {
      rules.push({ type: 'ruc' });
    }

    // Longitud mínima
    if (field.hasAttribute('minlength')) {
      rules.push({ 
        type: 'minLength', 
        value: parseInt(field.getAttribute('minlength')) 
      });
    }

    // Longitud máxima
    if (field.hasAttribute('maxlength')) {
      rules.push({ 
        type: 'maxLength', 
        value: parseInt(field.getAttribute('maxlength')) 
      });
    }

    // Pattern
    if (field.hasAttribute('pattern')) {
      rules.push({ 
        type: 'pattern', 
        value: new RegExp(field.getAttribute('pattern')) 
      });
    }

    // Number
    if (field.type === 'number') {
      rules.push({ type: 'number' });
      
      if (field.hasAttribute('min')) {
        rules.push({ 
          type: 'min', 
          value: parseFloat(field.getAttribute('min')) 
        });
      }
      
      if (field.hasAttribute('max')) {
        rules.push({ 
          type: 'max', 
          value: parseFloat(field.getAttribute('max')) 
        });
      }
    }

    // Términos y condiciones
    if (field.type === 'checkbox' && field.name === 'terms') {
      rules.push({ type: 'terms' });
    }

    return rules;
  };

  const getOrCreateErrorElement = (field) => {
    const fieldId = field.id || field.name;
    let errorElement = document.getElementById(`${fieldId}-error`);
    
    if (!errorElement) {
      errorElement = window.PeruLogistics.Utils.createElement('div', {
        id: `${fieldId}-error`,
        className: 'form-error',
        'aria-live': 'polite',
        'aria-atomic': 'true'
      });
      
      // Insertar después del campo
      field.parentNode.insertBefore(errorElement, field.nextSibling);
    }

    return errorElement;
  };

  /* ===================================
     EVENTOS DE FORMULARIO
     =================================== */

  const bindFormEvents = (form, formState) => {
    // Submit
    form.addEventListener('submit', (e) => handleFormSubmit(e, formState));
    
    // Reset
    form.addEventListener('reset', (e) => handleFormReset(e, formState));
    
    // Change detection para auto-save
    if (config.autoSave) {
      form.addEventListener('input', 
        window.PeruLogistics.EventUtils.debounce(() => {
          handleAutoSave(formState);
        }, config.autoSaveDelay)
      );
    }
  };

  const bindFieldEvents = (field, fieldConfig, formState) => {
    // Input event (validación en tiempo real)
    field.addEventListener('input', 
      window.PeruLogistics.EventUtils.debounce(() => {
        handleFieldInput(field, fieldConfig, formState);
      }, config.validationDelay)
    );

    // Blur event (validación al perder foco)
    field.addEventListener('blur', () => {
      handleFieldBlur(field, fieldConfig, formState);
    });

    // Focus event (limpiar errores)
    field.addEventListener('focus', () => {
      handleFieldFocus(field, fieldConfig, formState);
    });

    // Change event para selects y checkboxes
    if (field.type === 'select-one' || field.type === 'checkbox' || field.type === 'radio') {
      field.addEventListener('change', () => {
        handleFieldChange(field, fieldConfig, formState);
      });
    }

    // Formateo automático para ciertos tipos
    if (field.type === 'tel' || field.classList.contains('phone-input')) {
      field.addEventListener('input', () => formatPhoneInput(field));
    }
  };

  const bindGlobalEvents = () => {
    // Manejo de teclas globales
    document.addEventListener('keydown', handleGlobalKeydown);
    
    // Prevenir envío accidental
    window.addEventListener('beforeunload', handleBeforeUnload);
  };

  /* ===================================
     VALIDACIÓN
     =================================== */

  const validateField = (field, fieldConfig, showErrors = false) => {
    const value = field.value.trim();
    const errors = [];

    fieldConfig.rules.forEach(rule => {
      const error = runValidationRule(value, rule, field);
      if (error) {
        errors.push(error);
      }
    });

    // Actualizar estado
    fieldConfig.isValid = errors.length === 0;
    fieldConfig.value = value;

    if (showErrors || fieldConfig.showErrors) {
      showFieldErrors(field, fieldConfig, errors);
    }

    return fieldConfig.isValid;
  };

  const runValidationRule = (value, rule, field) => {
    switch (rule.type) {
      case 'required':
        if (!window.PeruLogistics.ValidationUtils.isRequired(value)) {
          return errorMessages.required;
        }
        break;

      case 'email':
        if (value && !window.PeruLogistics.ValidationUtils.isValidEmail(value)) {
          return errorMessages.email;
        }
        break;

      case 'phone':
        if (value && !window.PeruLogistics.ValidationUtils.isValidPeruvianPhone(value)) {
          return errorMessages.phone;
        }
        break;

      case 'dni':
        if (value && !window.PeruLogistics.ValidationUtils.isValidDNI(value)) {
          return errorMessages.dni;
        }
        break;

      case 'ruc':
        if (value && !window.PeruLogistics.ValidationUtils.isValidRUC(value)) {
          return errorMessages.ruc;
        }
        break;

      case 'minLength':
        if (value && !window.PeruLogistics.ValidationUtils.minLength(value, rule.value)) {
          return errorMessages.minLength.replace('{min}', rule.value);
        }
        break;

      case 'maxLength':
        if (!window.PeruLogistics.ValidationUtils.maxLength(value, rule.value)) {
          return errorMessages.maxLength.replace('{max}', rule.value);
        }
        break;

      case 'pattern':
        if (value && !rule.value.test(value)) {
          return errorMessages.pattern;
        }
        break;

      case 'number':
        if (value && !window.PeruLogistics.ValidationUtils.isNumeric(value)) {
          return errorMessages.number;
        }
        break;

      case 'min':
        if (value && parseFloat(value) < rule.value) {
          return errorMessages.min.replace('{min}', rule.value);
        }
        break;

      case 'max':
        if (value && parseFloat(value) > rule.value) {
          return errorMessages.max.replace('{max}', rule.value);
        }
        break;

      case 'terms':
        if (!field.checked) {
          return errorMessages.terms;
        }
        break;

      default:
        // Validador personalizado
        if (state.validators.has(rule.type)) {
          const validator = state.validators.get(rule.type);
          return validator(value, rule, field);
        }
    }

    return null;
  };

  const validateForm = (formState, showErrors = false) => {
    let isValid = true;

    formState.fields.forEach(fieldConfig => {
      const fieldValid = validateField(fieldConfig.element, fieldConfig, showErrors);
      if (!fieldValid) {
        isValid = false;
      }
    });

    formState.isValid = isValid;
    return isValid;
  };

  /* ===================================
     MANEJO DE EVENTOS DE CAMPO
     =================================== */

  const handleFieldInput = (field, fieldConfig, formState) => {
    formState.touched.add(field.name);
    
    if (config.showErrorsOnInput || fieldConfig.showErrors) {
      validateField(field, fieldConfig, true);
    }
    
    updateFormState(formState);
  };

  const handleFieldBlur = (field, fieldConfig, formState) => {
    formState.touched.add(field.name);
    fieldConfig.showErrors = true;
    
    if (config.showErrorsOnBlur) {
      validateField(field, fieldConfig, true);
    }
    
    updateFormState(formState);
  };

  const handleFieldFocus = (field, fieldConfig, formState) => {
    // Limpiar estado de error visual si el campo se está editando
    field.classList.remove('error');
    
    // Ocultar error si el campo está vacío
    if (!field.value.trim()) {
      hideFieldErrors(fieldConfig);
    }
  };

  const handleFieldChange = (field, fieldConfig, formState) => {
    formState.touched.add(field.name);
    validateField(field, fieldConfig, true);
    updateFormState(formState);
  };

  /* ===================================
     MOSTRAR/OCULTAR ERRORES
     =================================== */

  const showFieldErrors = (field, fieldConfig, errors) => {
    if (errors.length > 0) {
      field.classList.add('error');
      fieldConfig.errorElement.textContent = errors[0];
      fieldConfig.errorElement.classList.add('show');
      
      // Animar error
      if (!window.PeruLogistics.Animations.isReducedMotion) {
        fieldConfig.errorElement.classList.add('form-error-shake');
        setTimeout(() => {
          fieldConfig.errorElement.classList.remove('form-error-shake');
        }, 300);
      }
    } else {
      hideFieldErrors(fieldConfig);
    }
  };

  const hideFieldErrors = (fieldConfig) => {
    fieldConfig.element.classList.remove('error');
    fieldConfig.errorElement.textContent = '';
    fieldConfig.errorElement.classList.remove('show');
  };

  /* ===================================
     ENVÍO DE FORMULARIO
     =================================== */

  const handleFormSubmit = async (e, formState) => {
    e.preventDefault();
    
    if (formState.isSubmitting) return;

    // Validar todo el formulario
    const isValid = validateForm(formState, true);
    
    if (!isValid) {
      // Enfocar primer campo con error
      const firstErrorField = findFirstErrorField(formState);
      if (firstErrorField) {
        firstErrorField.focus();
        window.PeruLogistics.Utils.smoothScrollTo(firstErrorField, 500, 100);
      }
      
      window.PeruLogistics.NotificationUtils.error('Por favor corrige los errores en el formulario');
      return;
    }

    // Iniciar estado de envío
    setFormSubmitting(formState, true);

    try {
      // Obtener datos del formulario
      const formData = getFormData(formState);
      
      // Llamar al handler personalizado o usar el por defecto
      const submitHandler = state.submitHandlers.get(formState.element.id) || defaultSubmitHandler;
      
      const result = await submitHandler(formData, formState);
      
      if (result.success) {
        handleSubmitSuccess(result, formState);
      } else {
        handleSubmitError(result.error || 'Error al enviar el formulario', formState);
      }
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      handleSubmitError('Error inesperado al enviar el formulario', formState);
    } finally {
      setFormSubmitting(formState, false);
    }
  };

  const setFormSubmitting = (formState, isSubmitting) => {
    formState.isSubmitting = isSubmitting;
    const submitButton = formState.element.querySelector('button[type="submit"], input[type="submit"]');
    
    if (submitButton) {
      submitButton.disabled = isSubmitting;
      submitButton.classList.toggle('loading', isSubmitting);
    }
    
    formState.element.classList.toggle('submitting', isSubmitting);
  };

  const getFormData = (formState) => {
    const data = {};
    
    formState.fields.forEach((fieldConfig, fieldName) => {
      const field = fieldConfig.element;
      
      if (field.type === 'checkbox') {
        data[fieldName] = field.checked;
      } else if (field.type === 'radio') {
        if (field.checked) {
          data[fieldName] = field.value;
        }
      } else {
        data[fieldName] = field.value.trim();
      }
    });
    
    return data;
  };

  const defaultSubmitHandler = async (formData, formState) => {
    // Simulación de envío - reemplazar con lógica real
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Datos del formulario:', formData);
        resolve({ success: true, message: 'Formulario enviado correctamente' });
      }, 2000);
    });
  };

  const handleSubmitSuccess = (result, formState) => {
    window.PeruLogistics.NotificationUtils.success(
      result.message || 'Formulario enviado correctamente'
    );
    
    // Reset formulario si se especifica
    if (result.resetForm !== false) {
      resetForm(formState);
    }
    
    // Redirigir si se especifica
    if (result.redirectUrl) {
      setTimeout(() => {
        window.location.href = result.redirectUrl;
      }, 2000);
    }
    
    // Disparar evento personalizado
    window.PeruLogistics.EventUtils.trigger(formState.element, 'formSubmitSuccess', {
      result,
      formData: getFormData(formState)
    });
  };

  const handleSubmitError = (error, formState) => {
    window.PeruLogistics.NotificationUtils.error(
      typeof error === 'string' ? error : 'Error al enviar el formulario'
    );
    
    // Disparar evento personalizado
    window.PeruLogistics.EventUtils.trigger(formState.element, 'formSubmitError', {
      error,
      formData: getFormData(formState)
    });
  };

  /* ===================================
     UTILIDADES
     =================================== */

  const findFirstErrorField = (formState) => {
    for (const [fieldName, fieldConfig] of formState.fields) {
      if (!fieldConfig.isValid) {
        return fieldConfig.element;
      }
    }
    return null;
  };

  const updateFormState = (formState) => {
    validateForm(formState);
  };

  const resetForm = (formState) => {
    formState.element.reset();
    
    formState.fields.forEach(fieldConfig => {
      fieldConfig.isValid = true;
      fieldConfig.showErrors = false;
      fieldConfig.value = fieldConfig.originalValue;
      hideFieldErrors(fieldConfig);
    });
    
    formState.touched.clear();
    formState.isValid = false;
  };

  const handleFormReset = (e, formState) => {
    setTimeout(() => resetForm(formState), 0);
  };

  const formatPhoneInput = (field) => {
    let value = field.value.replace(/\D/g, '');
    
    if (value.length >= 9) {
      value = value.substring(0, 9);
      value = value.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
    }
    
    field.value = value;
  };

  const handleAutoSave = (formState) => {
    if (formState.autoSaveTimer) {
      clearTimeout(formState.autoSaveTimer);
    }
    
    formState.autoSaveTimer = setTimeout(() => {
      const formData = getFormData(formState);
      window.PeruLogistics.StorageUtils.setItem(
        `form_autosave_${formState.element.id}`,
        formData
      );
    }, config.autoSaveDelay);
  };

  const handleGlobalKeydown = (e) => {
    // Ctrl/Cmd + Enter para envío rápido
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      const activeForm = e.target.closest('form');
      if (activeForm) {
        const submitButton = activeForm.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.click();
        }
      }
    }
  };

  const handleBeforeUnload = (e) => {
    // Advertir si hay cambios sin guardar
    for (const [formId, formState] of state.forms) {
      if (hasUnsavedChanges(formState)) {
        e.preventDefault();
        e.returnValue = '';
        break;
      }
    }
  };

  const hasUnsavedChanges = (formState) => {
    if (formState.touched.size === 0) return false;
    
    for (const [fieldName, fieldConfig] of formState.fields) {
      if (fieldConfig.value !== fieldConfig.originalValue) {
        return true;
      }
    }
    
    return false;
  };

  /* ===================================
     VALIDADORES PERSONALIZADOS
     =================================== */

  const setupCustomValidators = () => {
    // Confirmar contraseña
    addValidator('confirmPassword', (value, rule, field) => {
      const passwordField = document.querySelector(rule.target || '[name="password"]');
      if (passwordField && value !== passwordField.value) {
        return 'Las contraseñas no coinciden';
      }
      return null;
    });

    // Fecha mínima
    addValidator('minDate', (value, rule, field) => {
      if (value) {
        const inputDate = new Date(value);
        const minDate = new Date(rule.value);
        if (inputDate < minDate) {
          return `La fecha debe ser posterior a ${window.PeruLogistics.FormatUtils.formatDate(minDate)}`;
        }
      }
      return null;
    });

    // Validación personalizada por expresión regular
    addValidator('regex', (value, rule, field) => {
      if (value && !rule.pattern.test(value)) {
        return rule.message || 'El formato no es válido';
      }
      return null;
    });
  };

  const addValidator = (name, validatorFn) => {
    state.validators.set(name, validatorFn);
  };

  /* ===================================
     SUBMIT HANDLERS PERSONALIZADOS
     =================================== */

  const addSubmitHandler = (formId, handlerFn) => {
    state.submitHandlers.set(formId, handlerFn);
  };

  // Submit handler para formulario de contacto
  const contactFormSubmitHandler = async (formData, formState) => {
    // Aquí iría la lógica específica del formulario de contacto
    console.log('Enviando formulario de contacto:', formData);
    
    // Simulación de envío
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Tu mensaje ha sido enviado. Te contactaremos pronto.',
          resetForm: true
        });
      }, 2000);
    });
  };

  /* ===================================
     API PÚBLICA
     =================================== */

  const publicAPI = {
    init,
    addValidator,
    addSubmitHandler,
    validateForm: (formId) => {
      const formState = state.forms.get(formId);
      return formState ? validateForm(formState, true) : false;
    },
    resetForm: (formId) => {
      const formState = state.forms.get(formId);
      if (formState) resetForm(formState);
    },
    getFormData: (formId) => {
      const formState = state.forms.get(formId);
      return formState ? getFormData(formState) : null;
    },
    setFieldValue: (formId, fieldName, value) => {
      const formState = state.forms.get(formId);
      if (formState && formState.fields.has(fieldName)) {
        const fieldConfig = formState.fields.get(fieldName);
        fieldConfig.element.value = value;
        fieldConfig.value = value;
      }
    }
  };

  return publicAPI;
})();

/* ===================================
   INICIALIZACIÓN AUTOMÁTICA
   =================================== */

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    FormSystem.init();
    
    // Configurar submit handler para formulario de contacto
    FormSystem.addSubmitHandler('contactForm', async (formData, formState) => {
      console.log('Enviando formulario de contacto:', formData);
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: 'Tu mensaje ha sido enviado. Te contactaremos en menos de 24 horas.',
            resetForm: true
          });
        }, 2000);
      });
    });
  });
} else {
  FormSystem.init();
}

// Exportar al namespace global
window.PeruLogistics.Forms = FormSystem;