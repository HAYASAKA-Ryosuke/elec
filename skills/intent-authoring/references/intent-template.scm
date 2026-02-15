(intent
  (app env_monitor)
  (read bme280 (interval_ms 1000))
  (rule (if (temp_gt 30.0)) (then (led blink)))
  (telemetry (stdout true))
)
