/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com
 */

// Composables
import { createVuetify } from 'vuetify'
import { mdi } from 'vuetify/iconsets/mdi'
import { customIcons } from '@/assets/Icons/customIcons'
import { adjustColorBrightness } from '@/utils/ThemeUtils'

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export function initializeVuetify (primaryLightColor = '#9AA502', primaryDarkColor = '#9AA502') {
  const vuetify = createVuetify({
    defaults: {
      VBtn: {
        class: 'text-body-medium',
      },
    },
    icons: {
      defaultSet: 'mdi',
      sets: {
        mdi,
        custom: customIcons,
      },
    },
    theme: {
      themes: {
        light: {
          dark: false,
          colors: {
            primary: primaryLightColor,
            'on-primary': '#FFFFFF',           // Forces white text on primary buttons
            primarySurface: adjustColorBrightness(primaryLightColor, 0.5),
            
            // --- SCHUNK LIGHT THEME (HIGH CONTRAST) ---
            background: '#F0F4F8',
            appBar: '#FFFFFF',                 
            'on-appBar': '#001B47',            // Dark blue text on white header
            
            navigationMenu: '#001B47',         
            'on-navigationMenu': '#FFFFFF',    // <-- THE FIX: Forces white text on the dark sidebar
            
            navigationMenuSecondary: '#051433',
            'on-navigationMenuSecondary': '#FFFFFF',
            
            appNavigation: '#001B47',          
            'on-appNavigation': '#FFFFFF',
            
            card: '#FFFFFF',
            'on-card': '#0F172A',
            cardDialog: '#FFFFFF',
            cardHeader: '#F8FAFC',
            elevatedCard: '#FFFFFF',
            
            detailsCard: '#FFFFFF',
            detailsHeader: '#F8FAFC',
            listItem: '#9AA502',               
            hover: '#051433',                  
            buttonText: '#FFFFFF',
            divider: '#E2E8F0',
            listItemText: '#FFFFFF',           
            subtitleText: '#64748B',
            normalText: '#0F172A',             
            lamp: '#7A7A7A',
            tableHeader: '#F0F4F8',
            tableOdd: '#FFFFFF',
            tableEven: '#F8FAFC',
            invertedButton: '#001B47',
            'on-invertedButton': '#FFFFFF',
            lightButton: '#F0F4F8',
            icon: '#001B47',                   
            titleText: '#001B47',              
          },
        },
        dark: {
          dark: true,
          colors: {
            primary: primaryDarkColor,
            'on-primary': '#050B14',           // Dark text on Pistachio Green buttons
            primarySurface: adjustColorBrightness(primaryDarkColor, -0.5),
            
            // --- SCHUNK DARK THEME ---
            background: '#050B14',             
            appBar: '#0A1428',                 
            'on-appBar': '#FFFFFF',
            
            navigationMenu: '#0A1428',         
            'on-navigationMenu': '#FFFFFF',
            
            navigationMenuSecondary: '#050B14',
            appNavigation: '#050B14',
            card: '#111E3A',                   
            cardDialog: '#0A1428',
            cardHeader: '#142446',
            elevatedCard: '#142446',
            
            detailsCard: '#0A1428',
            detailsHeader: '#050B14',
            listItem: '#9AA502',                 
            hover: '#1A2C4F',                  
            buttonText: '#050B14',             
            divider: '#1A2C4F',
            listItemText: '#F8FAFC',           
            subtitleText: '#94A3B8',
            normalText: '#F8FAFC',             
            lamp: '#959595',
            tableHeader: '#0A1428',
            tableOdd: '#111E3A',
            tableEven: '#0A1428',
            invertedButton: '#F8FAFC',
            lightButton: '#142446',
            icon: '#9AA502',                   
            titleText: '#FFFFFF',              
          },
        },
      },
    },
  })
  return vuetify
}
