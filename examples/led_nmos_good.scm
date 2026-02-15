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
    (comp R_LED
      (type resistor)
      (pins (1) (2))
      (props
        (value 330ohm)
      )
    )
    (comp D1
      (type led)
      (pins (A) (K))
      (props)
    )
    (comp Q1
      (type mosfet_nch)
      (pins
        (G (role io) (net_role signal))
        (D (role io) (gt S) (neq S))
        (S (role io) (net_role gnd) (lt D) (neq D))
      )
      (props)
    )
  )
  (nets
    (net VCC_3V3
      (voltage 3.3)
      (connect
        (U_MCU VCC)
        (R_LED 1)
      )
    )
    (net GND
      (voltage 0)
      (connect
        (U_MCU GND)
        (Q1 S)
      )
    )
    (net LED_PATH
      (voltage 3.3)
      (connect
        (R_LED 2)
        (D1 A)
      )
    )
    (net LED_RETURN
      (voltage 3.3)
      (connect
        (D1 K)
        (Q1 D)
      )
    )
    (net LED_GATE
      (voltage 3.3)
      (connect
        (U_MCU LED_GPIO)
        (Q1 G)
      )
    )
  )
  (constraints)
)
