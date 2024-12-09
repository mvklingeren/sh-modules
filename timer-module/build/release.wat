(module
 (type $0 (func))
 (type $1 (func (result f64)))
 (type $2 (func (param i32 f64)))
 (type $3 (func (param i32 i32 i32 i32)))
 (import "index" "getCurrentTime" (func $assembly/index/getCurrentTime (result f64)))
 (import "index" "emitMessage" (func $assembly/index/emitMessage (param i32 f64)))
 (import "env" "abort" (func $~lib/builtins/abort (param i32 i32 i32 i32)))
 (global $assembly/index/lastTime (mut f64) (f64.const 0))
 (global $assembly/index/isRunning (mut i32) (i32.const 0))
 (global $~lib/memory/__stack_pointer (mut i32) (i32.const 33932))
 (memory $0 1)
 (data $0 (i32.const 1036) "\1c")
 (data $0.1 (i32.const 1048) "\02\00\00\00\08\00\00\00T\00I\00C\00K")
 (data $1 (i32.const 1068) "\1c")
 (data $1.1 (i32.const 1080) "\02\00\00\00\n\00\00\00S\00T\00A\00R\00T")
 (data $2 (i32.const 1100) "\1c")
 (data $2.1 (i32.const 1112) "\02\00\00\00\08\00\00\00S\00T\00O\00P")
 (data $3 (i32.const 1132) "\1c")
 (data $3.1 (i32.const 1144) "\02\00\00\00\n\00\00\00R\00E\00S\00E\00T")
 (export "tick" (func $assembly/index/tick))
 (export "run" (func $assembly/index/run))
 (export "stop" (func $assembly/index/stop))
 (export "reset" (func $assembly/index/reset))
 (export "memory" (memory $0))
 (func $assembly/index/tick
  (local $0 f64)
  global.get $~lib/memory/__stack_pointer
  i32.const 4
  i32.sub
  global.set $~lib/memory/__stack_pointer
  global.get $~lib/memory/__stack_pointer
  i32.const 1164
  i32.lt_s
  if
   i32.const 33952
   i32.const 34000
   i32.const 1
   i32.const 1
   call $~lib/builtins/abort
   unreachable
  end
  global.get $~lib/memory/__stack_pointer
  i32.const 0
  i32.store
  global.get $assembly/index/isRunning
  i32.eqz
  if
   global.get $~lib/memory/__stack_pointer
   i32.const 4
   i32.add
   global.set $~lib/memory/__stack_pointer
   return
  end
  call $assembly/index/getCurrentTime
  local.tee $0
  global.get $assembly/index/lastTime
  f64.sub
  f64.const 1e3
  f64.ge
  if
   global.get $~lib/memory/__stack_pointer
   i32.const 1056
   i32.store
   i32.const 1056
   local.get $0
   call $assembly/index/emitMessage
   local.get $0
   global.set $assembly/index/lastTime
  end
  global.get $~lib/memory/__stack_pointer
  i32.const 4
  i32.add
  global.set $~lib/memory/__stack_pointer
 )
 (func $assembly/index/run
  global.get $~lib/memory/__stack_pointer
  i32.const 4
  i32.sub
  global.set $~lib/memory/__stack_pointer
  global.get $~lib/memory/__stack_pointer
  i32.const 1164
  i32.lt_s
  if
   i32.const 33952
   i32.const 34000
   i32.const 1
   i32.const 1
   call $~lib/builtins/abort
   unreachable
  end
  global.get $~lib/memory/__stack_pointer
  i32.const 0
  i32.store
  global.get $assembly/index/isRunning
  i32.eqz
  if
   i32.const 1
   global.set $assembly/index/isRunning
   call $assembly/index/getCurrentTime
   global.set $assembly/index/lastTime
   global.get $~lib/memory/__stack_pointer
   i32.const 1088
   i32.store
   i32.const 1088
   global.get $assembly/index/lastTime
   call $assembly/index/emitMessage
   call $assembly/index/tick
  end
  global.get $~lib/memory/__stack_pointer
  i32.const 4
  i32.add
  global.set $~lib/memory/__stack_pointer
 )
 (func $assembly/index/stop
  global.get $~lib/memory/__stack_pointer
  i32.const 4
  i32.sub
  global.set $~lib/memory/__stack_pointer
  global.get $~lib/memory/__stack_pointer
  i32.const 1164
  i32.lt_s
  if
   i32.const 33952
   i32.const 34000
   i32.const 1
   i32.const 1
   call $~lib/builtins/abort
   unreachable
  end
  global.get $~lib/memory/__stack_pointer
  i32.const 0
  i32.store
  i32.const 0
  global.set $assembly/index/isRunning
  global.get $~lib/memory/__stack_pointer
  i32.const 1120
  i32.store
  i32.const 1120
  call $assembly/index/getCurrentTime
  call $assembly/index/emitMessage
  global.get $~lib/memory/__stack_pointer
  i32.const 4
  i32.add
  global.set $~lib/memory/__stack_pointer
 )
 (func $assembly/index/reset
  global.get $~lib/memory/__stack_pointer
  i32.const 4
  i32.sub
  global.set $~lib/memory/__stack_pointer
  global.get $~lib/memory/__stack_pointer
  i32.const 1164
  i32.lt_s
  if
   i32.const 33952
   i32.const 34000
   i32.const 1
   i32.const 1
   call $~lib/builtins/abort
   unreachable
  end
  global.get $~lib/memory/__stack_pointer
  i32.const 0
  i32.store
  call $assembly/index/getCurrentTime
  global.set $assembly/index/lastTime
  global.get $assembly/index/isRunning
  if
   global.get $~lib/memory/__stack_pointer
   i32.const 1152
   i32.store
   i32.const 1152
   global.get $assembly/index/lastTime
   call $assembly/index/emitMessage
  end
  global.get $~lib/memory/__stack_pointer
  i32.const 4
  i32.add
  global.set $~lib/memory/__stack_pointer
 )
)
