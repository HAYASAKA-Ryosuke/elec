(circuit
  (components
    (comp U_MCU
      (type pico)
      (pins
        (VCC (role power_in) (vmin 1.8) (vmax 3.6))
        (GND (role gnd) (vmin 0) (vmax 0))
        (LED_GPIO (role io) (vmin 0) (vmax 3.6))
      )
      (props)
    )
    (comp D1
      (type led)
      (pins
        (A)
        (K)
      )
      (props)
    )
  )
  (nets
    (net VCC_3V3
      (voltage 3.3)
      (connect
        (U_MCU VCC)
      )
    )
    (net GND
      (voltage 0)
      (connect
        (U_MCU GND)
        (D1 K)
      )
    )
    (net LED_DRIVE
      (voltage 3.3)
      (connect
        (U_MCU LED_GPIO)
        (D1 A)
      )
    )
  )
  (constraints)
)
