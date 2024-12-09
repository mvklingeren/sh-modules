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
 (global $assembly/index/INTERVAL f64 (f64.const 1e3))
 (global $~lib/memory/__data_end i32 (i32.const 140))
 (global $~lib/memory/__stack_pointer (mut i32) (i32.const 32908))
 (global $~lib/memory/__heap_base i32 (i32.const 32908))
 (memory $0 1)
 (data $0 (i32.const 12) "\1c\00\00\00\00\00\00\00\00\00\00\00\02\00\00\00\08\00\00\00T\00I\00C\00K\00\00\00\00\00")
 (data $1 (i32.const 44) "\1c\00\00\00\00\00\00\00\00\00\00\00\02\00\00\00\n\00\00\00S\00T\00A\00R\00T\00\00\00")
 (data $2 (i32.const 76) "\1c\00\00\00\00\00\00\00\00\00\00\00\02\00\00\00\08\00\00\00S\00T\00O\00P\00\00\00\00\00")
 (data $3 (i32.const 108) "\1c\00\00\00\00\00\00\00\00\00\00\00\02\00\00\00\n\00\00\00R\00E\00S\00E\00T\00\00\00")
 (table $0 1 1 funcref)
 (elem $0 (i32.const 1))
 (export "tick" (func $assembly/index/tick))
 (export "run" (func $assembly/index/run))
 (export "stop" (func $assembly/index/stop))
 (export "reset" (func $assembly/index/reset))
 (export "memory" (memory $0))
 (func $~stack_check
  global.get $~lib/memory/__stack_pointer
  global.get $~lib/memory/__data_end
  i32.lt_s
  if
   i32.const 32928
   i32.const 32976
   i32.const 1
   i32.const 1
   call $~lib/builtins/abort
   unreachable
  end
 )
 (func $assembly/index/tick
  (local $currentTime f64)
  (local $elapsed f64)
  (local $2 i32)
  global.get $~lib/memory/__stack_pointer
  i32.const 4
  i32.sub
  global.set $~lib/memory/__stack_pointer
  call $~stack_check
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
  local.set $currentTime
  local.get $currentTime
  global.get $assembly/index/lastTime
  f64.sub
  local.set $elapsed
  local.get $elapsed
  global.get $assembly/index/INTERVAL
  f64.ge
  if
   i32.const 32
   local.set $2
   global.get $~lib/memory/__stack_pointer
   local.get $2
   i32.store
   local.get $2
   local.get $currentTime
   call $assembly/index/emitMessage
   local.get $currentTime
   global.set $assembly/index/lastTime
  end
  global.get $~lib/memory/__stack_pointer
  i32.const 4
  i32.add
  global.set $~lib/memory/__stack_pointer
 )
 (func $assembly/index/run
  (local $0 i32)
  global.get $~lib/memory/__stack_pointer
  i32.const 4
  i32.sub
  global.set $~lib/memory/__stack_pointer
  call $~stack_check
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
   i32.const 64
   local.set $0
   global.get $~lib/memory/__stack_pointer
   local.get $0
   i32.store
   local.get $0
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
  (local $0 i32)
  global.get $~lib/memory/__stack_pointer
  i32.const 4
  i32.sub
  global.set $~lib/memory/__stack_pointer
  call $~stack_check
  global.get $~lib/memory/__stack_pointer
  i32.const 0
  i32.store
  i32.const 0
  global.set $assembly/index/isRunning
  i32.const 96
  local.set $0
  global.get $~lib/memory/__stack_pointer
  local.get $0
  i32.store
  local.get $0
  call $assembly/index/getCurrentTime
  call $assembly/index/emitMessage
  global.get $~lib/memory/__stack_pointer
  i32.const 4
  i32.add
  global.set $~lib/memory/__stack_pointer
 )
 (func $assembly/index/reset
  (local $0 i32)
  global.get $~lib/memory/__stack_pointer
  i32.const 4
  i32.sub
  global.set $~lib/memory/__stack_pointer
  call $~stack_check
  global.get $~lib/memory/__stack_pointer
  i32.const 0
  i32.store
  call $assembly/index/getCurrentTime
  global.set $assembly/index/lastTime
  global.get $assembly/index/isRunning
  if
   i32.const 128
   local.set $0
   global.get $~lib/memory/__stack_pointer
   local.get $0
   i32.store
   local.get $0
   global.get $assembly/index/lastTime
   call $assembly/index/emitMessage
  end
  global.get $~lib/memory/__stack_pointer
  i32.const 4
  i32.add
  global.set $~lib/memory/__stack_pointer
 )
)
