// MellowProbe: an AutoCAD .NET plugin that makes AutoCAD's behaviour readable from a transcript.
// It loads in accoreconsole and in acad.exe; what needs acmgd (the CommandLineMonitor, the command
// history) works only in acad.exe. Every line it writes starts with "«MP " so a reader can split
// it from AutoCAD's own echo. See .claude/skills/autocad-research/tracing.md.
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;
using Autodesk.AutoCAD.ApplicationServices.Core;
using Autodesk.AutoCAD.DatabaseServices;
using Autodesk.AutoCAD.EditorInput;
using Autodesk.AutoCAD.Geometry;
using Autodesk.AutoCAD.Runtime;
using System.Runtime.CompilerServices;
using AcDoc = Autodesk.AutoCAD.ApplicationServices.Document;
using Clm = Autodesk.AutoCAD.Internal.PreviousInput.CommandLineMonitor;
using ClmServices = Autodesk.AutoCAD.Internal.PreviousInput.CommandLineMonitorServices;

[assembly: CommandClass(typeof(MellowProbe.Commands))]
[assembly: ExtensionApplication(typeof(MellowProbe.App))]

namespace MellowProbe
{
    public class App : IExtensionApplication
    {
        public void Initialize() => Log.W("loaded " + typeof(App).Assembly.Location);
        public void Terminate() { }
    }

    static class Host
    {
        public static readonly bool IsConsole =
            System.Diagnostics.Process.GetCurrentProcess().ProcessName.Equals("accoreconsole", StringComparison.OrdinalIgnoreCase);
    }

    static class Log
    {
        public static TextWriter File;
        static readonly CultureInfo Inv = CultureInfo.InvariantCulture;

        public static void W(string s)
        {
            File?.WriteLine(s);
            File?.Flush();
            var ed = Application.DocumentManager.MdiActiveDocument?.Editor;
            ed?.WriteMessage("\n«MP " + s + "»");
        }

        public static string Q(string s) => s == null ? "null" : "\"" + s.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\n", "\\n").Replace("\r", "\\r") + "\"";

        public static string V(object v)
        {
            switch (v)
            {
                case null: return "null";
                case string s: return Q(s);
                case bool b: return b ? "true" : "false";
                case double d: return d.ToString("R", Inv);
                case float f: return f.ToString("R", Inv);
                case Enum e: return Q(e.ToString());
                case IFormattable n when v.GetType().IsPrimitive: return n.ToString(null, Inv);
                case Point3d p: return $"[{V(p.X)},{V(p.Y)},{V(p.Z)}]";
                case Point2d p: return $"[{V(p.X)},{V(p.Y)}]";
                case Vector3d p: return $"[{V(p.X)},{V(p.Y)},{V(p.Z)}]";
                case Vector2d p: return $"[{V(p.X)},{V(p.Y)}]";
                case ObjectId id: return id.IsNull ? "null" : Q(id.Handle.ToString());
                case Handle h: return Q(h.ToString());
                case Autodesk.AutoCAD.Colors.Color c: return Q(c.ToString());
                case KeywordCollection k: return Kw(k);
                case ResultBuffer rb: return "[" + string.Join(",", rb.AsArray().Select(t => "[" + t.TypeCode + "," + V(t.Value) + "]")) + "]";
                case Point3dCollection pc: return "[" + string.Join(",", pc.Cast<Point3d>().Select(p => V(p))) + "]";
                case double[] da: return "[" + string.Join(",", da.Select(p => V(p))) + "]";
                case Vector2d[] va: return "[" + string.Join(",", va.Select(p => V(p))) + "]";
                case DoubleCollection dc: return "[" + string.Join(",", dc.Cast<double>().Select(p => V(p))) + "]";
                default: return Q(v.ToString());
            }
        }

        static string Kw(KeywordCollection k)
        {
            var items = k.Cast<Keyword>().Select(x =>
                $"{{\"g\":{Q(x.GlobalName)},\"l\":{Q(x.LocalName)},\"d\":{Q(x.DisplayName)}" +
                (x.Visible ? "" : ",\"hidden\":true") + (x.Enabled ? "" : ",\"disabled\":true") + "}");
            string def = null;
            try { def = k.Default; } catch { }
            return "{\"default\":" + Q(def) + ",\"items\":[" + string.Join(",", items) + "]}";
        }

        static readonly HashSet<Type> Simple = new HashSet<Type> {
            typeof(Point3d), typeof(Point2d), typeof(Vector3d), typeof(Vector2d), typeof(ObjectId), typeof(Handle),
            typeof(Autodesk.AutoCAD.Colors.Color), typeof(KeywordCollection), typeof(ResultBuffer) };

        static readonly HashSet<string> Skip = new HashSet<string> {
            "IsReadOnly", "IsWriteEnabled", "IsNotifyEnabled", "IsUndoing", "IsModified", "IsModifiedXData",
            "IsModifiedGraphics", "IsNewObject", "IsTransactionResident", "IsReallyClosing", "IsNotifying",
            "IsCancelling", "IsPersistent", "IsDisposed", "AutoDelete", "UnmanagedObject", "IsAProxy",
            "IsKindOfMember", "HasSaveVersionOverride", "Database", "OwnerId", "ObjectId", "ExtensionDictionary",
            "ClassID", "AcadObject", "Bounds", "GeometricExtents", "Ecs", "CompoundObjectTransform",
            "BlockTransform", "Annotative", "ForceAnnoAllVisible", "IsEraseStatusToggled", "IsObjectIdsInFlux",
            "PaperOrientation", "IsAccessible", "IsMemberOfCurrentAnnotationScale", "HasFields", "XData",
            "MergeStyle", "Drawable", "DrawableType", "Id", "Bounds", "IsPlanar", "UndoFiler", "MaterialMapper" };

        // Every readable property whose value prints on one line: enough to see what a prompt or an
        // entity holds without writing a dumper per class.
        public static string Props(object o, params string[] extra)
        {
            var sb = new StringBuilder("{");
            bool first = true;
            void Add(string k, string v) { if (!first) sb.Append(','); first = false; sb.Append(Q(k)).Append(':').Append(v); }
            foreach (var x in extra.Where((_, i) => i % 2 == 0).Zip(extra.Where((_, i) => i % 2 == 1)))
                Add(x.First, x.Second);
            foreach (var p in o.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance).OrderBy(p => p.Name))
            {
                if (!p.CanRead || p.GetIndexParameters().Length > 0 || Skip.Contains(p.Name)) continue;
                var t = p.PropertyType;
                if (!(t.IsPrimitive || t.IsEnum || t == typeof(string) || t == typeof(decimal) || Simple.Contains(t))) continue;
                string val;
                try { val = V(p.GetValue(o)); } catch { continue; }
                Add(p.Name, val);
            }
            return sb.Append('}').ToString();
        }
    }

    // Prompt tracing: the public Editor events give each prompt's options (message, keywords with
    // global and local names, defaults); the internal CommandLineMonitor adds what AutoCAD itself
    // was asked for, including built-in commands: the initget keyword string and flags.
    static class Trace
    {
        static readonly List<Action> Detach = new List<Action>();
        public static bool On => Detach.Count > 0;

        public static void Attach(AcDoc doc, bool db)
        {
            var ed = doc.Editor;
            foreach (var ev in typeof(Editor).GetEvents())
            {
                if (!(ev.Name.StartsWith("Prompting") || ev.Name.StartsWith("Prompted"))) continue;
                Hook(ed, ev, "ed." + ev.Name, (n, a) => EditorEvent(n, a));
            }
            foreach (var name in new[] { "CommandWillStart", "CommandEnded", "CommandCancelled", "CommandFailed", "UnknownCommand", "LispWillStart", "LispEnded", "LispCancelled" })
            {
                var ev = typeof(AcDoc).GetEvent(name);
                if (ev != null) Hook(doc, ev, "doc." + name, (n, a) => Emit(n + " " + Log.Props(a)));
            }
            // acmgd (CommandLineMonitor) exists only in acad.exe: loading it in accoreconsole hangs.
            if (Host.IsConsole) Log.W("clm skipped (accoreconsole)");
            else try { AttachMonitor(doc); }
            catch (System.Exception e) { Log.W("clm unavailable " + Log.Q(e.GetType().Name + ": " + e.Message)); }
            if (db)
            {
                var d = doc.Database;
                ObjectEventHandler app = (s, e) => Emit("db.appended " + Ent(e.DBObject));
                ObjectEventHandler mod = (s, e) => Emit("db.modified " + Ent(e.DBObject));
                ObjectErasedEventHandler era = (s, e) => Emit("db." + (e.Erased ? "erased " : "unerased ") + Log.Q(e.DBObject.GetRXClass().DxfName) + " " + Log.Q(e.DBObject.Handle.ToString()));
                d.ObjectAppended += app; d.ObjectModified += mod; d.ObjectErased += era;
                Detach.Add(() => { d.ObjectAppended -= app; d.ObjectModified -= mod; d.ObjectErased -= era; });
            }
        }

        static string Ent(DBObject o)
        {
            // Only entities and the tables a command writes are worth a line; dictionaries, xrecords
            // and block records churn on every command.
            if (o is Entity || o is SymbolTableRecord && !(o is BlockTableRecord)) return Log.Q(o.GetRXClass().DxfName) + " " + Log.Q(o.Handle.ToString());
            return Log.Q(o.GetRXClass().DxfName) + " " + Log.Q(o.Handle.ToString()) + " (non-entity)";
        }

        public static void Off()
        {
            foreach (var d in Detach) try { d(); } catch { }
            Detach.Clear();
        }

        static void Hook(object target, EventInfo ev, string name, Action<string, object> sink)
        {
            var invoke = ev.EventHandlerType.GetMethod("Invoke");
            var ps = invoke.GetParameters().Select(p => Expression.Parameter(p.ParameterType)).ToArray();
            Expression arg = ps.Length > 1 ? Expression.Convert(ps[1], typeof(object)) : Expression.Constant(null);
            var call = Expression.Invoke(Expression.Constant(sink), Expression.Constant(name), arg);
            var del = Expression.Lambda(ev.EventHandlerType, call, ps).Compile();
            ev.AddEventHandler(target, del);
            Detach.Add(() => ev.RemoveEventHandler(target, del));
        }

        public static bool Raw;
        static readonly HashSet<string> shown = new HashSet<string>();
        static readonly Dictionary<string, (string line, string value)> held = new Dictionary<string, (string, string)>();
        static readonly Dictionary<string, string> cursor = new Dictionary<string, string>();

        // A jig re-prompts once per keystroke the console feeds it, and each of those samples
        // returns the console's fixed cursor (or the distance or angle to it); a distance prompt
        // nests a point prompt, so the samples of both interleave. Compact mode prints each prompt
        // once, holds each result until the next one of its kind, and drops a result whose value
        // repeats: that value is the cursor, learned per kind. Raw keeps every event.
        static void EditorEvent(string name, object args)
        {
            var opt = args?.GetType().GetProperty("Options")?.GetValue(args);
            var res = args?.GetType().GetProperty("Result")?.GetValue(args);
            var line = name + " " + (args == null ? "{}" : Log.Props(opt ?? res ?? args));
            if (Raw) { Log.W(line); return; }
            if (name.StartsWith("ed.Prompting"))
            {
                if (!shown.Add(line)) return;
                // A prompt not seen yet means the results held so far were answers, not samples.
                FlushHeld(); Log.W(line); return;
            }
            var status = res?.GetType().GetProperty("Status")?.GetValue(res)?.ToString();
            var value = res?.GetType().GetProperty("Value")?.GetValue(res);
            if (status == "OK" && (value is Point3d || value is double))
            {
                var v = Log.V(value);
                if (cursor.TryGetValue(name, out var c) && c == v) return;
                if (held.TryGetValue(name, out var h))
                {
                    held.Remove(name);
                    if (h.value == v) { cursor[name] = v; return; }
                    Log.W(h.line);
                }
                held[name] = (line, v);
                return;
            }
            Emit(line);
        }

        static void FlushHeld()
        {
            foreach (var h in held.Values) Log.W(h.line);
            held.Clear();
        }

        static void Flush() { FlushHeld(); shown.Clear(); }

        public static void Emit(string line) { Flush(); Log.W(line); }

        [MethodImpl(MethodImplOptions.NoInlining)]
        static void AttachMonitor(AcDoc doc)
        {
            var clm = ClmServices.Instance().GetCommandLineMonitor(doc);
            foreach (var ev in typeof(Clm).GetEvents())
                Hook(clm, ev, "clm." + ev.Name, (n, a) => MonitorEvent(clm, n, a));
        }

        [MethodImpl(MethodImplOptions.NoInlining)]
        static void MonitorEvent(Clm clm, string name, object args)
        {
            string a = args == null ? "{}" : Log.Props(args);
            string state;
            try
            {
                state = "{\"cmd\":" + Log.Q(clm.CurrentCommandName) +
                    ",\"prompt\":" + Log.Q(clm.CurrentPrompt) +
                    ",\"mode\":" + Log.Q(clm.CurrentMode.ToString()) +
                    ",\"initget\":" + Log.Q(clm.CurrentInitgetKeywords) +
                    ",\"initgetFlags\":" + clm.CurrentInitgetFlags +
                    ",\"kwordsIn\":" + Log.Q(clm.CurrentKeywordsIn) +
                    ",\"control\":" + Log.Q(clm.CurrentInputControlFlags.ToString()) +
                    ",\"basePt\":" + (clm.CurrentPointInFlag ? Log.V(clm.CurrentPointIn) : "null") +
                    ",\"nesting\":" + clm.CurrentNestingCount + "}";
            }
            catch (System.Exception e) { state = Log.Q(e.Message); }
            Emit(name + " " + a + " " + state);
        }
    }

    public class Commands
    {
        static Editor Ed => Application.DocumentManager.MdiActiveDocument.Editor;

        [CommandMethod("MELLOWPROBE", "MPTRACE", CommandFlags.Modal | CommandFlags.NoHistory | CommandFlags.NoUndoMarker)]
        public static void MpTrace() => Safe(MpTraceBody);

        [CommandMethod("MELLOWPROBE", "MPDUMP", CommandFlags.Modal | CommandFlags.NoHistory | CommandFlags.NoUndoMarker)]
        public static void MpDump() => Safe(MpDumpBody);

        [CommandMethod("MELLOWPROBE", "MPGRIPS", CommandFlags.Modal | CommandFlags.NoHistory | CommandFlags.NoUndoMarker)]
        public static void MpGrips() => Safe(MpGripsBody);

        [CommandMethod("MELLOWPROBE", "MPGRIPMOVE", CommandFlags.Modal | CommandFlags.NoHistory)]
        public static void MpGripMove() => Safe(MpGripMoveBody);

        [CommandMethod("MELLOWPROBE", "MPSYSVARS", CommandFlags.Modal | CommandFlags.NoHistory | CommandFlags.NoUndoMarker)]
        public static void MpSysvars() => Safe(MpSysvarsBody);

        [CommandMethod("MELLOWPROBE", "MPCMD", CommandFlags.Modal | CommandFlags.NoHistory | CommandFlags.NoUndoMarker)]
        public static void MpCmd() => Safe(MpCmdBody);

        [CommandMethod("MELLOWPROBE", "MPHIST", CommandFlags.Modal | CommandFlags.NoHistory | CommandFlags.NoUndoMarker)]
        public static void MpHist() => Safe(MpHistBody);

        // An exception escaping a command opens a dialog that hangs accoreconsole.
        static void Safe(Action body)
        {
            try { body(); }
            catch (System.Exception e) { Log.W("error " + Log.Q(e.ToString())); }
        }

        static string AskString(string msg)
        {
            // An empty answer to a .NET prompt hangs accoreconsole, so "-" stands for "none".
            var o = new PromptStringOptions("\n" + msg) { AllowSpaces = true };
            var r = Ed.GetString(o);
            return r.Status == PromptStatus.OK && r.StringResult != "-" ? r.StringResult : null;
        }

        // MPTRACE [Db|Off]: start (or stop) tracing prompts; Db also logs each object the drawing
        // appends, modifies or erases.
        static void MpTraceBody()
        {
            var r = Ed.GetKeywords(new PromptKeywordOptions("\nMellowProbe trace [On/Db/Raw/Off/File]", "On Db Raw Off File"));
            var k = r.Status == PromptStatus.OK ? r.StringResult : "Off";
            Trace.Off();
            Trace.Raw = k == "Raw";
            if (k == "Raw") k = "Db";
            if (k == "Off") { Log.File?.Dispose(); Log.File = null; Log.W("trace off"); return; }
            if (k == "File")
            {
                var path = AskString("Trace file:");
                Log.File = new StreamWriter(path, false, new UTF8Encoding(false));
                k = "Db";
            }
            Trace.Attach(Application.DocumentManager.MdiActiveDocument, k == "Db");
            Log.W("trace " + k.ToLowerInvariant());
        }

        // MPDUMP [file]: every entity of model space, one JSON object per line, with every readable
        // simple property plus the vertices that need a call to read.
        static void MpDumpBody()
        {
            var path = AskString("Dump file (- for console):");
            var db = Application.DocumentManager.MdiActiveDocument.Database;
            var lines = new List<string>();
            using (var tr = db.TransactionManager.StartOpenCloseTransaction())
            {
                var ms = (BlockTableRecord)tr.GetObject(SymbolUtilityServices.GetBlockModelSpaceId(db), OpenMode.ForRead);
                foreach (ObjectId id in ms)
                {
                    var e = (Entity)tr.GetObject(id, OpenMode.ForRead);
                    var extra = new List<string> { "dxf", Log.Q(e.GetRXClass().DxfName), "handle", Log.Q(e.Handle.ToString()) };
                    if (e is Polyline pl)
                    {
                        var vs = Enumerable.Range(0, pl.NumberOfVertices).Select(i =>
                            $"[{Log.V(pl.GetPoint2dAt(i).X)},{Log.V(pl.GetPoint2dAt(i).Y)},{Log.V(pl.GetBulgeAt(i))},{Log.V(pl.GetStartWidthAt(i))},{Log.V(pl.GetEndWidthAt(i))}]");
                        extra.Add("vertices"); extra.Add("[" + string.Join(",", vs) + "]");
                    }
                    // A heavy polyline's vertices are objects of their own: their bulge, widths,
                    // fit tangent and type (spline frame, spline-fit, curve-fit) only read one by one.
                    if (e is Polyline2d p2)
                    {
                        var vs = p2.Cast<ObjectId>().Select(v => (Vertex2d)tr.GetObject(v, OpenMode.ForRead)).Select(v =>
                            $"[{Log.V(v.Position)},{Log.V(v.Bulge)},{Log.V(v.StartWidth)},{Log.V(v.EndWidth)},{Log.Q(v.VertexType.ToString())},{(v.TangentUsed ? Log.V(v.Tangent) : "null")}]");
                        extra.Add("vertices"); extra.Add("[" + string.Join(",", vs) + "]");
                    }
                    if (e is Polyline3d p3)
                    {
                        var vs = p3.Cast<ObjectId>().Select(v => (PolylineVertex3d)tr.GetObject(v, OpenMode.ForRead)).Select(v =>
                            $"[{Log.V(v.Position)},{Log.Q(v.VertexType.ToString())}]");
                        extra.Add("vertices"); extra.Add("[" + string.Join(",", vs) + "]");
                    }
                    if (e is Spline sp)
                    {
                        extra.Add("controlPoints"); extra.Add(Log.V(sp.NurbsData.GetControlPoints()));
                        extra.Add("knots"); extra.Add(Log.V(sp.NurbsData.GetKnots()));
                        if (sp.IsRational) { extra.Add("weights"); extra.Add(Log.V(sp.NurbsData.GetWeights())); }
                        if (sp.HasFitData) { var fd = sp.FitData; extra.Add("startFitTangent"); extra.Add(Log.V(fd.StartTangent)); extra.Add("endFitTangent"); extra.Add(Log.V(fd.EndTangent)); extra.Add("knotParam"); extra.Add(Log.V(fd.KnotParam)); }
                        if (sp.NumFitPoints > 0) { extra.Add("fitPoints"); extra.Add("[" + string.Join(",", Enumerable.Range(0, sp.NumFitPoints).Select(i => Log.V(sp.GetFitPointAt(i)))) + "]"); }
                    }
                    // A region's loops are only seen exploded: its curves in the order and sense
                    // AutoCAD keeps them, and the area properties MASSPROP prints, unrounded.
                    if (e is Region rg)
                    {
                        var parts = new DBObjectCollection();
                        try { rg.Explode(parts); } catch { }
                        extra.Add("curves"); extra.Add("[" + string.Join(",", parts.Cast<DBObject>().Select(c =>
                            c is Curve cv ? Log.Props(cv, "dxf", Log.Q(cv.GetRXClass().DxfName), "from", Log.V(cv.StartPoint), "to", Log.V(cv.EndPoint))
                                          : Log.Props(c, "dxf", Log.Q(c.GetRXClass().DxfName)))) + "]");
                        try
                        {
                            var plane = rg.GetPlane();
                            var cs = plane.GetCoordinateSystem();
                            Point3d o = cs.Origin; Vector3d xa = cs.Xaxis, ya = cs.Yaxis;
                            var ap = rg.AreaProperties(ref o, ref xa, ref ya);
                            extra.Add("areaProperties"); extra.Add(Log.Props(ap, "centroid", Log.V(ap.Centroid), "moments", Log.V(ap.MomentsOfInertia), "principal", Log.V(ap.PrincipalMoments), "radii", Log.V(ap.RadiiOfGyration), "origin", Log.V(cs.Origin)));
                        }
                        catch (System.Exception ex) { extra.Add("areaProperties"); extra.Add(Log.Q(ex.Message)); }
                    }
                    // A solid's topology is only seen through the B-rep: each vertex, each edge with
                    // its curve and ends, each face with its surface and loops (edges and vertices in
                    // loop order, so each coedge's sense reads off them), plus MASSPROP unrounded.
                    if (e is Solid3d so)
                    {
                        try
                        {
                            var mp = so.MassProperties;
                            extra.Add("massProperties"); extra.Add("{\"volume\":" + Log.V(mp.Volume) + ",\"centroid\":" + Log.V(mp.Centroid) +
                                ",\"moments\":" + Log.V(mp.MomentsOfIntertia) + ",\"products\":" + Log.V(mp.ProductsOfIntertia) +
                                ",\"principal\":" + Log.V(mp.PrincipalMoments) +
                                ",\"radii\":" + Log.V(mp.RadiiOfGyration) + ",\"extents\":[" + Log.V(mp.Extents.MinPoint) + "," + Log.V(mp.Extents.MaxPoint) + "]}");
                        }
                        catch (System.Exception ex) { extra.Add("massProperties"); extra.Add(Log.Q(ex.Message)); }
                        try { extra.Add("brep"); extra.Add(BrepDump(so)); }
                        catch (System.Exception ex) { extra.Add("brep"); extra.Add(Log.Q(ex.GetType().Name + ": " + ex.Message)); }
                    }
                    if (e is BlockReference br)
                    {
                        var atts = br.AttributeCollection.Cast<ObjectId>().Select(a => Log.Props(tr.GetObject(a, OpenMode.ForRead)));
                        extra.Add("attributes"); extra.Add("[" + string.Join(",", atts) + "]");
                    }
                    lines.Add(Log.Props(e, extra.ToArray()));
                }
            }
            if (string.IsNullOrEmpty(path)) foreach (var l in lines) Log.W("ent " + l);
            else { File.WriteAllLines(path, lines, new UTF8Encoding(false)); Log.W($"dumped {lines.Count} entities to {Log.Q(path)}"); }
        }

        static string BrepDump(Entity solid)
        {
            using (var brep = new Autodesk.AutoCAD.BoundaryRepresentation.Brep(solid))
            {
                var vertices = brep.Vertices.Cast<Autodesk.AutoCAD.BoundaryRepresentation.Vertex>().ToList();
                var edges = brep.Edges.Cast<Autodesk.AutoCAD.BoundaryRepresentation.Edge>().ToList();
                int VertexIndex(Autodesk.AutoCAD.BoundaryRepresentation.Vertex v) => vertices.FindIndex(w => w.Point.IsEqualTo(v.Point));
                int EdgeIndex(Autodesk.AutoCAD.BoundaryRepresentation.Edge x) => edges.FindIndex(y => y.Vertex1.Point.IsEqualTo(x.Vertex1.Point) && y.Vertex2.Point.IsEqualTo(x.Vertex2.Point) && Same(y, x));
                string Curve(Autodesk.AutoCAD.BoundaryRepresentation.Edge x)
                {
                    Curve3d c = null;
                    try { c = x.Curve; } catch { }
                    var native = c is ExternalCurve3d ext && ext.IsNativeCurve ? ext.NativeCurve : c;
                    return native == null ? "null" : Log.Props(native, "kind", Log.Q(native.GetType().Name));
                }
                string Surface(Autodesk.AutoCAD.BoundaryRepresentation.Face f)
                {
                    Autodesk.AutoCAD.Geometry.Surface s = null;
                    try { s = f.Surface; } catch { }
                    if (s is ExternalBoundedSurface eb)
                    {
                        Autodesk.AutoCAD.Geometry.Surface b = null;
                        try { b = eb.BaseSurface; } catch { }
                        
                        if (b != null) return Log.Props(b, "kind", Log.Q(b.GetType().Name));
                    }
                    return s == null ? "null" : Log.Props(s, "kind", Log.Q(s.GetType().Name));
                }
                var faces = brep.Faces.Cast<Autodesk.AutoCAD.BoundaryRepresentation.Face>().Select(f =>
                {
                    var loops = f.Loops.Cast<Autodesk.AutoCAD.BoundaryRepresentation.BoundaryLoop>().Select(l =>
                        "{\"type\":" + Log.V(l.LoopType) +
                        ",\"edges\":[" + string.Join(",", l.Edges.Cast<Autodesk.AutoCAD.BoundaryRepresentation.Edge>().Select(EdgeIndex)) + "]" +
                        ",\"vertices\":[" + string.Join(",", l.Vertices.Cast<Autodesk.AutoCAD.BoundaryRepresentation.Vertex>().Select(VertexIndex)) + "]}");
                    double area = double.NaN;
                    try { area = f.GetArea(); } catch { }
                    return "{\"surface\":" + Surface(f) + ",\"orientToSurface\":" + Log.V(f.IsOrientToSurface) + ",\"area\":" + Log.V(area) +
                        ",\"loops\":[" + string.Join(",", loops) + "]}";
                });
                return "{\"vertices\":[" + string.Join(",", vertices.Select(v => Log.V(v.Point))) + "]" +
                    ",\"edges\":[" + string.Join(",", edges.Select(x => "{\"from\":" + VertexIndex(x.Vertex1) + ",\"to\":" + VertexIndex(x.Vertex2) +
                        ",\"orientToCurve\":" + Log.V(x.IsOrientToCurve) + ",\"curve\":" + Curve(x) + "}")) + "]" +
                    ",\"faces\":[" + string.Join(",", faces) + "]" +
                    ",\"shells\":" + brep.Shells.Cast<object>().Count() + ",\"volume\":" + Log.V(brep.GetVolume()) + ",\"surfaceArea\":" + Log.V(brep.GetSurfaceArea()) + "}";
            }
        }

        // An edge is told from another with the same ends (two arcs of a circle) by its midpoint.
        static bool Same(Autodesk.AutoCAD.BoundaryRepresentation.Edge a, Autodesk.AutoCAD.BoundaryRepresentation.Edge b)
        {
            try
            {
                var ca = a.Curve; var cb = b.Curve;
                var ia = ca.GetInterval(); var ib = cb.GetInterval();
                return ca.EvaluatePoint((ia.LowerBound + ia.UpperBound) / 2).IsEqualTo(cb.EvaluatePoint((ib.LowerBound + ib.UpperBound) / 2));
            }
            catch { return true; }
        }

        // MPGRIPS: each entity of model space and the grip points it offers (GetGripPoints), as a
        // selected object shows them: what the console cannot draw.
        static void MpGripsBody()
        {
            var db = Application.DocumentManager.MdiActiveDocument.Database;
            using (var tr = db.TransactionManager.StartOpenCloseTransaction())
            {
                var ms = (BlockTableRecord)tr.GetObject(SymbolUtilityServices.GetBlockModelSpaceId(db), OpenMode.ForRead);
                foreach (ObjectId id in ms)
                {
                    var e = (Entity)tr.GetObject(id, OpenMode.ForRead);
                    var pts = new Point3dCollection();
                    var modes = new IntegerCollection();
                    var gids = new IntegerCollection();
                    try { e.GetGripPoints(pts, modes, gids); }
                    catch (System.Exception ex) { Log.W($"grips {Log.Q(e.GetRXClass().DxfName)} {Log.Q(e.Handle.ToString())} error {Log.Q(ex.Message)}"); continue; }
                    Log.W($"grips {Log.Q(e.GetRXClass().DxfName)} {Log.Q(e.Handle.ToString())} {Log.V(pts)}");
                }
            }
        }

        // MPGRIPMOVE handle index dx,dy: drags one grip of an entity as a grip edit does
        // (MoveGripPointsAt), for what the console cannot drag.
        static void MpGripMoveBody()
        {
            var handle = AskString("Handle:");
            var index = Ed.GetInteger(new PromptIntegerOptions("\nGrip index:"));
            var by = Ed.GetPoint(new PromptPointOptions("\nOffset:"));
            if (handle == null || index.Status != PromptStatus.OK || by.Status != PromptStatus.OK) return;
            var db = Application.DocumentManager.MdiActiveDocument.Database;
            var id = db.GetObjectId(false, new Handle(Convert.ToInt64(handle, 16)), 0);
            using (var tr = db.TransactionManager.StartTransaction())
            {
                var e = (Entity)tr.GetObject(id, OpenMode.ForWrite);
                e.MoveGripPointsAt(new IntegerCollection(new[] { index.Value }), by.Value - Point3d.Origin);
                tr.Commit();
            }
            Log.W($"gripmoved {Log.Q(handle)} {index.Value}");
        }

        // MPSYSVARS [file]: every system variable with its value, type, range and where it is
        // stored (per session, user, profile, drawing, viewport), tab-separated.
        static void MpSysvarsBody()
        {
            var path = AskString("Sysvar file (- for console):");
            var rows = new List<string> { "name\tvalue\tprimaryType\tsecondaryType\tstorage\tlower\tupper\treadOnly\tlocked\ttypeFlags" };
            foreach (Variable v in SystemObjects.Variables)
            {
                string val;
                try { val = Log.V(v.Value); } catch (System.Exception e) { val = "!" + e.Message; }
                string lo = "", hi = "";
                try { lo = v.Range.LowerBound.ToString(); hi = v.Range.UpperBound.ToString(); } catch { }
                rows.Add(string.Join("\t", v.Name, val, v.PrimaryType, v.SecondaryType, v.Storage, lo, hi, v.IsReadOnly, v.IsLocked, v.TypeFlags));
            }
            if (string.IsNullOrEmpty(path)) foreach (var r in rows) Log.W("var " + r);
            else { File.WriteAllLines(path, rows, new UTF8Encoding(false)); Log.W($"wrote {rows.Count - 1} variables to {Log.Q(path)}"); }
        }

        // MPCMD name...: whether each name is a command here, a core one, and its local name.
        static void MpCmdBody()
        {
            var names = AskString("Command names (space-separated, or @file):");
            if (names == null) return;
            IEnumerable<string> list = names.StartsWith("@") ? File.ReadAllLines(names.Substring(1)) : names.Split(' ');
            if (Host.IsConsole) { Log.W("cmd unavailable in accoreconsole: use (getcname \"_NAME\")"); return; }
            foreach (var n in list.Select(s => s.Trim()).Where(s => s.Length > 0))
            {
                try { Log.W("cmd " + CmdInfo(n)); }
                catch (System.Exception e) { Log.W($"cmd {Log.Q(n)} unavailable {Log.Q(e.GetType().Name)}"); return; }
            }
        }

        [MethodImpl(MethodImplOptions.NoInlining)]
        static string CmdInfo(string n)
        {
            bool def = Autodesk.AutoCAD.Internal.Utils.IsCommandDefined(n);
            bool core = false; string local = null;
            try { core = Autodesk.AutoCAD.Internal.Utils.IsCoreCommand(n); } catch { }
            try { local = ClmServices.Instance().GetLocalCommandName(n); } catch { }
            return $"{Log.Q(n)} defined={def} core={core} local={Log.Q(local)} lisp={Autodesk.AutoCAD.Internal.Utils.IsLispCommandDefined(n)}";
        }

        // MPHIST n file: the last n lines of the command line, written to a file (acad.exe only;
        // echoing them would push the history being read).
        static void MpHistBody()
        {
            var r = Ed.GetInteger(new PromptIntegerOptions("\nLines:"));
            var path = AskString("History file:");
            if (Host.IsConsole) { Log.W("hist unavailable in accoreconsole"); return; }
            if (r.Status != PromptStatus.OK || path == null) return;
            try { File.WriteAllLines(path, Hist(r.Value), new UTF8Encoding(false)); }
            catch (System.Exception e) { Log.W("hist unavailable " + Log.Q(e.GetType().Name)); }
        }

        [MethodImpl(MethodImplOptions.NoInlining)]
        static List<string> Hist(int n) => Autodesk.AutoCAD.Internal.Utils.GetLastCommandLines(n, true);
    }
}
