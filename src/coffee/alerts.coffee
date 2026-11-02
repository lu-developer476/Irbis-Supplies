# SweetAlert2 helpers. Dependen del global `Swal` cargado por CDN.
currentLanguage = ->
  try
    if window.localStorage.getItem("irbis_language") is "en" then "en" else "es"
  catch
    "es"

message = (spanish, english) ->
  if currentLanguage() is "en" then english else spanish

fire = (opts) ->
  Swal.fire Object.assign {
    background: "var(--irbis-bg-elevated, #1e1e1e)"
    color: "var(--irbis-text, #fff)"
    confirmButtonColor: "var(--irbis-accent, #c2a34a)"
  }, opts

notifyProductAdded = (nombre) ->
  fire
    title: message("Producto agregado", "Product added")
    text: if currentLanguage() is "en" then "#{nombre} was added to your cart" else "#{nombre} fue añadido al carrito"
    icon: "success"
    timer: 1600
    showConfirmButton: false

notifyCartCleared = ->
  fire
    title: message("Carrito vacío", "Cart cleared")
    text: message("Se eliminaron todos los productos", "All items were removed")
    icon: "info"
    timer: 1400
    showConfirmButton: false

confirmCheckout = (total) ->
  fire
    title: message("Confirmar compra", "Confirm purchase")
    html: "<b>#{message("Total", "Total")}:</b> $#{total.toLocaleString(if currentLanguage() is "en" then "en-US" else "es-AR")}"
    icon: "question"
    showCancelButton: true
    confirmButtonText: message("Comprar", "Buy")
    cancelButtonText: message("Cancelar", "Cancel")

export { notifyProductAdded, notifyCartCleared, confirmCheckout }
